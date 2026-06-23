import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VendorStatus } from '@prisma/client';

export class VendorQueryDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number = 10;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ enum: VendorStatus }) @IsOptional() @IsString() status?: VendorStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() categoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sortBy?: string = 'createdAt';
  @ApiPropertyOptional({ enum: ['asc', 'desc'] }) @IsOptional() @IsIn(['asc', 'desc']) order?: 'asc' | 'desc' = 'desc';
}
