import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVendorDto {
  @ApiPropertyOptional() @IsOptional() @IsString() businessName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactPersonName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() businessDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankAccountNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ifscCode?: string;
}
