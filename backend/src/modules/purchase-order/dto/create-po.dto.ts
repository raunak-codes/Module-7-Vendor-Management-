import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PoLineDto {
  @ApiProperty() @IsNotEmpty() @IsString() description: string;
  @ApiProperty() @IsNumber() @Min(1) quantity: number;
  @ApiProperty() @IsNumber() @IsPositive() unitPrice: number;
}

export class CreatePoDto {
  @ApiProperty() @IsNotEmpty() vendorId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() eventId?: string;
  @ApiProperty() @IsNumber() @IsPositive() totalAmount: number;
  @ApiPropertyOptional() @IsOptional() @IsString() currency?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() issueDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() expectedDeliveryDate?: string;
  @ApiProperty({ type: [PoLineDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => PoLineDto) lines: PoLineDto[];
}
