import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SetUpSwagger } from './swagger/setup.swagger';
import { GlobalHttpExceptionFilter } from '../common/filters/http-exception.filter';
import { SuccessResponseInterceptor } from '../common/interceptors/success-response.interceptor';
import cookieParser from 'cookie-parser';

function normalizeOrigin(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';

  try {
    return new URL(trimmed).origin.toLowerCase();
  } catch {
    return trimmed.replace(/\/+$/, '').toLowerCase();
  }
}

function parseAllowedOrigins() {
  const fromFrontendUrl = process.env.FRONTEND_URL ?? '';
  const fromList = process.env.CORS_ALLOWED_ORIGINS ?? '';

  const values = [fromFrontendUrl, ...fromList.split(',')]
    .map((item) => normalizeOrigin(item))
    .filter(Boolean);

  return Array.from(new Set(values));
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalInterceptors(new SuccessResponseInterceptor());

  const allowedOrigins = parseAllowedOrigins();

  if (allowedOrigins.length === 0) {
    logger.warn(
      'CORS allow-list is empty (FRONTEND_URL/CORS_ALLOWED_ORIGINS not set). Temporarily allowing any browser origin.',
    );
  } else {
    logger.log(`CORS allow-list: ${allowedOrigins.join(', ')}`);
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow same-origin/server-to-server requests (no Origin header).
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.length === 0) {
        callback(null, true);
        return;
      }

      const normalizedRequestOrigin = normalizeOrigin(origin);

      if (allowedOrigins.includes(normalizedRequestOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  });
  SetUpSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
