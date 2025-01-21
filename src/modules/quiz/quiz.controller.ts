import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { AtGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decarators';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('create')
  @UseGuards(AtGuard)
  // любой авторизованный (Role.USER) может создавать
  create(@Request() req, @Body() dto: CreateQuizDto) {
    const userId = req.user.sub; // или req.user.id
    return this.quizService.createQuiz(dto, userId);
  }

  @Get()
  @UseGuards(AtGuard)
  findAll() {
    return this.quizService.findAll();
  }

  @Get(':id')
  @UseGuards(AtGuard)
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }

  @Get('findAllByQuizId/:id')
  @UseGuards(AtGuard)
  findAllByQuizId(@Param('id') id: string) {
    return this.quizService.findAllByQuizId(id);
  }

  @Patch(':id')
  @UseGuards(AtGuard)
  update(@Param('id') id: string, @Body() dto: UpdateQuizDto, @Request() req) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    return this.quizService.updateQuiz(id, dto, userId, userRole);
  }

  @Delete(':id')
  @UseGuards(AtGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    return this.quizService.removeQuiz(id, userId, userRole);
  }
}
