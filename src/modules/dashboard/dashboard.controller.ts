// src/dashboard/dashboard.controller.ts
import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AtGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decarators';

@ApiTags('dashboard')
@Controller('admin/dashboard')
@UseGuards(AtGuard, RolesGuard)
@Roles('admin')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description:
      'Агрегированные данные для административной панели с фильтрацией по датам',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Начальная дата в формате ISO (например, 2023-01-01)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Конечная дата в формате ISO (например, 2023-01-31)',
  })
  async getDashboardData(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    let start: Date = null;
    let end: Date = null;
    if (startDate) {
      start = new Date(startDate);
      if (isNaN(start.getTime())) {
        throw new BadRequestException('Invalid startDate');
      }
    }
    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        throw new BadRequestException('Invalid endDate');
      }
    }
    return this.dashboardService.getAggregatedDashboardData(start, end);
  }
}
