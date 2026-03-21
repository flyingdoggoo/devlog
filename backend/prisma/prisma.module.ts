// prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()  // ✅ global để không cần import lại ở mọi module
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule {}