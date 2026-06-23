import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AuditService } from '../audit/audit.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redis: RedisService,
    private audit: AuditService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email }, include: { vendor: true } });
    if (!user?.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    if (user.isDeleted) throw new UnauthorizedException('Account has been deactivated');

    const token = this.jwtService.sign({ id: user.id });
    await this.audit.log({ userId: user.id, action: 'LOGIN', entity: 'User', entityId: user.id, changes: { email: user.email, role: user.role } });
    return {
      token,
      user: { id: user.id, email: user.email, role: user.role, vendorId: user.vendorId, vendorStatus: user.vendor?.status ?? null },
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email is already registered');

    let category = await this.prisma.vendorCategory.findFirst({ where: { name: dto.vendorCategory } });
    if (!category) category = await this.prisma.vendorCategory.create({ data: { name: dto.vendorCategory } });

    const passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.$transaction(async (tx) => {
      const vendor = await tx.vendor.create({
        data: {
          businessName: dto.businessName,
          contactPersonName: dto.contactName,
          address: dto.address,
          gstNumber: dto.gstNumber ?? null,
          panNumber: dto.panNumber ?? null,
          bankAccountNumber: dto.bankAccountNumber ?? null,
          ifscCode: dto.ifscCode ?? null,
          categoryId: category.id,
          status: 'PENDING',
        },
      });
      const user = await tx.user.create({
        data: { email: dto.email, phone: dto.phone ?? null, passwordHash, role: 'VENDOR', vendorId: vendor.id },
      });
      return { userId: user.id, email: user.email, vendorId: vendor.id, businessName: vendor.businessName };
    }).then(async (result) => {
      // Notify all admins of new vendor registration (outside transaction)
      try {
        const admins = await this.prisma.user.findMany({ where: { role: 'ADMIN', isDeleted: false }, select: { id: true } });
        await this.prisma.notification.createMany({
          data: admins.map((a) => ({
            userId: a.id,
            type: 'INFO',
            title: 'New Vendor Registration',
            message: `${result.businessName} (${result.email}) has registered and is pending KYC approval.`,
          })),
        });
      } catch (err) {
        this.logger.warn(`Failed to notify admins of registration: ${err.message}`);
      }
      return result;
    });
  }

  async logout(token: string) {
    await this.redis.blacklistToken(token);
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, phone: true, role: true, vendorId: true, createdAt: true, vendor: { select: { businessName: true, status: true } } },
    });
  }
}
