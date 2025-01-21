import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';

import { AtGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decarators';
import {
  ChangePasswordDto,
  CreateUserDto,
  SetPasswordDto,
  UpdateUserDto,
  UpdateUserRoleDto,
} from './dto';

@Controller('users')
@UseGuards(AtGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  @UseGuards(AtGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() createUserDto: CreateUserDto) {
    // Предположим, у нас в DTO есть поле password и опционально role
    const createdUser = await this.userService.create(createUserDto);
    return createdUser;
  }

  @UseGuards(AtGuard)
  @Get('me')
  async getMe(@Req() req) {
    const userId = req.user.sub;
    return this.userService.findById(userId);
  }

  @UseGuards(AtGuard)
  @Patch('me')
  async updateMe(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.sub;
    return this.userService.updateProfile(userId, updateUserDto);
  }

  @UseGuards(AtGuard)
  @Patch('change-password')
  async changePassword(
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = req.user.sub;
    await this.userService.changePassword(userId, changePasswordDto);
    return { message: 'Пароль успешно изменен' };
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('query') searchQuery?: string,
  ) {
    page = Number(page) || 1;
    limit = Number(limit) || 10;

    const { count, rows } = await this.userService.findAll(
      page,
      limit,
      searchQuery,
    );

    return {
      totalUsers: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      users: rows,
    };
  }

  @UseGuards(AtGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/role')
  async updateUserRole(
    @Param('id') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.userService.updateUserRole(userId, updateUserRoleDto);
  }

  // src/users/users.controller.ts

  @UseGuards(AtGuard)
  @Patch('set-password')
  async setPassword(@Req() req, @Body() dto: SetPasswordDto) {
    const userId = req.user.sub;
    return this.userService.setPassword(userId, dto);
  }

  @UseGuards(AtGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async removeUser(@Param('id') userId: string): Promise<void> {
    return this.userService.remove(userId);
  }
}
