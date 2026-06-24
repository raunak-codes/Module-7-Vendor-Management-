import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RatingService {
  constructor(private prisma: PrismaService) {}

  async create(vendorId: string, reviewerId: string, body: { rating: number; review?: string; eventId?: string }) {
    if (body.rating < 1 || body.rating > 5) throw new BadRequestException('Rating must be between 1 and 5');
    const rating = await this.prisma.vendorRating.create({
      data: { vendorId, reviewerId, rating: body.rating, review: body.review ?? null, eventId: body.eventId ?? null },
    });
    return rating;
  }

  async getByVendor(vendorId: string) {
    return this.prisma.vendorRating.findMany({ where: { vendorId }, include: { reviewer: { select: { email: true, role: true } } }, orderBy: { createdAt: 'desc' } });
  }
}
