import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SetUpSwagger } from './swagger/setup.swagger';
import { GlobalHttpExceptionFilter } from '../common/filters/http-exception.filter';
import { SuccessResponseInterceptor } from '../common/interceptors/success-response.interceptor';
import cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalInterceptors(new SuccessResponseInterceptor());
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });
  SetUpSwagger(app)

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
