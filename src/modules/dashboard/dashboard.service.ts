// src/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User } from '../user/entities/user.entity';
import { Quiz } from '../quiz/entities/quiz.entity';
import { Question } from '../question/entities/question.entity';
import { Option } from '../option/entities/option.entity';
import { UserQuizResult } from '../user-quiz-result/entities/user-quiz-result.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Quiz) private quizModel: typeof Quiz,
    @InjectModel(Question) private questionModel: typeof Question,
    @InjectModel(Option) private optionModel: typeof Option,
    @InjectModel(UserQuizResult)
    private userQuizResultModel: typeof UserQuizResult,
  ) {}

  /**
   * Собирает статистику по пользователям с опциональной фильтрацией по дате создания.
   */
  async getUserStatistics(startDate?: Date, endDate?: Date) {
    const whereCondition: any = {};
    if (startDate && endDate) {
      whereCondition.createdAt = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      whereCondition.createdAt = { [Op.gte]: startDate };
    } else if (endDate) {
      whereCondition.createdAt = { [Op.lte]: endDate };
    }

    const totalUsers = await this.userModel.count({ where: whereCondition });
    const blockedUsers = await this.userModel.count({
      where: { isBlocked: true, ...whereCondition },
    });

    // Определим активных пользователей как тех, у кого lastLogin за последние 30 дней
    const activeThreshold = new Date();
    activeThreshold.setDate(activeThreshold.getDate() - 30);
    const activeUsers = await this.userModel.count({
      where: {
        lastLogin: { [Op.gte]: activeThreshold },
        ...whereCondition,
      },
    });

    return { totalUsers, blockedUsers, activeUsers };
  }

  /**
   * Собирает статистику по квизам без фильтрации.
   */
  async getQuizStatistics() {
    const totalQuizzes = await this.quizModel.count();
    const totalQuestions = await this.questionModel.count();
    const totalOptions = await this.optionModel.count();

    return { totalQuizzes, totalQuestions, totalOptions };
  }

  /**
   * Собирает статистику по результатам прохождения квизов с опциональной фильтрацией по дате.
   */
  async getQuizResultStatistics(startDate?: Date, endDate?: Date) {
    const whereCondition: any = {};
    if (startDate && endDate) {
      whereCondition.createdAt = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      whereCondition.createdAt = { [Op.gte]: startDate };
    } else if (endDate) {
      whereCondition.createdAt = { [Op.lte]: endDate };
    }

    const totalAttempts = await this.userQuizResultModel.count({
      where: whereCondition,
    });

    const avgResult = await this.userQuizResultModel.findOne({
      attributes: [
        [
          this.userQuizResultModel.sequelize.fn(
            'AVG',
            this.userQuizResultModel.sequelize.col('score'),
          ),
          'avgScore',
        ],
      ],
      where: whereCondition,
      raw: true,
    });
    const avgScore = parseFloat(avgResult['avgScore']) || 0;

    return { totalAttempts, avgScore };
  }

  /**
   * Объединяет все агрегированные данные для дашборда с опциональной фильтрацией по датам.
   */
  async getAggregatedDashboardData(startDate?: Date, endDate?: Date) {
    const userStats = await this.getUserStatistics(startDate, endDate);
    const quizStats = await this.getQuizStatistics();
    const resultStats = await this.getQuizResultStatistics(startDate, endDate);

    return {
      users: userStats,
      quizzes: quizStats,
      quizResults: resultStats,
    };
  }
}
