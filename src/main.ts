import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './exceptions/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import * as cookieParse from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParse());
  app.enableCors({
    origin: process.env.APP_ORIGIN_IN_CORS.trim().split(' ') || ['*'],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  try {
    await app.listen(process.env.APP_PORT || 3000);
    console.log('Server is running ', await app.getUrl());
  } catch (error) {
    console.log('Server is ' + error);
  }
}
bootstrap();
