import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@prisma/prisma.module';
import { AuthModule } from '@authentication/auth.module';
import { PostsModule } from './posts/posts.module';
import { TagsModule } from './tags/tags.module';
import { NotificationModule } from './notification/notification.module';
@Module({
  imports: [UsersModule, PrismaModule, AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PostsModule,
    TagsModule,
    NotificationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
