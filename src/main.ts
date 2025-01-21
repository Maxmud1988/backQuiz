import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.enableCors({
    origin: configService.get<string>('frontendUrl') || 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  // app.enableCors({
  //   origin: 'http://localhost:3000', // Ваш фронтенд URL
  //   credentials: true,
  // });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  const port = configService.get<number>('port');

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Your API')
    .setDescription('API description')
    .setVersion('1.0')
    .addTag('users') // Добавление тега 'users' в описание документа
    .addBearerAuth() // Добавление Bearer токена
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Сохранение документации в файл
  writeFileSync('./swagger-doc.json', JSON.stringify(document, null, 2), {
    encoding: 'utf8',
  });
  SwaggerModule.setup('api', app, document);
  await app.listen(port);
}
bootstrap();
