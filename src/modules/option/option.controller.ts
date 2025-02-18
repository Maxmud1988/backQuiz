import {
  Controller,
  Post,
  Param,
  Body,
  Get,
  Patch,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OptionService } from './option.service';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import { AtGuard } from '../auth/guards';
import { Role } from '../user/Enums/role.enum';

@Controller('option')
@UseGuards(AtGuard)
export class OptionController {
  constructor(private readonly optionService: OptionService) {}

  /**
   * Создать новый вариант ответа для вопроса
   */
  @Post(':questionId')
  createOption(
    @Param('questionId') questionId: string,
    @Body() dto: CreateOptionDto,
    @Request() req,
  ) {
    const currentUserId = req.user.sub;
    const currentUserRole: Role = req.user.role;
    return this.optionService.createOption(
      questionId,
      dto,
      currentUserId,
      currentUserRole,
    );
  }

  /**
   * Получить все варианты для конкретного вопроса
   */
  @Get(':questionId')
  findAllByQuestion(@Param('questionId') questionId: string) {
    return this.optionService.findAll(questionId);
  }

  /**
   * Получить конкретный вариант
   */
  @Get('item/:id')
  findOne(@Param('id') id: string) {
    return this.optionService.findOne(id);
  }

  /**
   * Обновить вариант ответа
   */
  @Patch(':id')
  updateOption(
    @Param('id') id: string,
    @Body() dto: UpdateOptionDto,
    @Request() req,
  ) {
    const currentUserId = req.user.sub;
    const currentUserRole: Role = req.user.role;
    return this.optionService.updateOption(
      id,
      dto,
      currentUserId,
      currentUserRole,
    );
  }

  /**
   * Удалить вариант ответа
   */
  @Delete(':id')
  removeOption(@Param('id') id: string, @Request() req) {
    const currentUserId = req.user.sub;
    const currentUserRole: Role = req.user.role;
    return this.optionService.removeOption(id, currentUserId, currentUserRole);
  }
}
