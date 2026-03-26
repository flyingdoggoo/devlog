import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { Observable, map } from 'rxjs';
  
  @Injectable()
  export class SuccessResponseInterceptor implements NestInterceptor {
    intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        map((data) => {
          // Tránh bọc lồng nếu handler đã return theo chuẩn { ok: ... }
          if (data && typeof data === 'object' && 'ok' in data) return data;
  
          return {
            ok: true,
            data,
          };
        }),
      );
    }
  }