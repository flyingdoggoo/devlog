import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Ghi đè phương thức handleRequest mặc định của Passport
  handleRequest(err, user, info) {
    // Bình thường, nếu không có user hoặc có lỗi, nó sẽ throw UnauthorizedException.
    // Ở đây chúng ta bảo nó: "Cứ bình tĩnh, có user thì trả về user, không có thì trả về null/undefined, không được báo lỗi!"
    return user || undefined;
  }
}