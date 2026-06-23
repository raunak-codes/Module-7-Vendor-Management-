import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @MinLength(8) password: string;
  @ApiProperty() @IsNotEmpty() businessName: string;
  @ApiProperty() @IsNotEmpty() contactName: string;
  @ApiProperty() @IsNotEmpty() address: string;
  @ApiProperty() @IsNotEmpty() vendorCategory: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gstNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() panNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankAccountNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ifscCode?: string;
}
