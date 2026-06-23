import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RatingService } from './rating.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Ratings')
@ApiBearerAuth()
@Controller('vendors/:vendorId/ratings')
export class RatingController {
  constructor(private ratingService: RatingService) {}

  @Get() @ApiOperation({ summary: 'Get all ratings for a vendor' })
  async getAll(@Param('vendorId') vendorId: string) {
    const data = await this.ratingService.getByVendor(vendorId);
    return { message: 'Ratings fetched', data };
  }

  @Post() @ApiOperation({ summary: 'Submit a rating for a vendor' })
  async create(@Param('vendorId') vendorId: string, @Body() body: any, @CurrentUser() user: any) {
    const data = await this.ratingService.create(vendorId, user.id, body);
    return { message: 'Rating submitted', data };
  }
}
