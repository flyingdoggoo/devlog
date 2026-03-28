import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@prisma/prisma.module';
import { AuthModule } from '@authentication/auth.module';
import { PostsModule } from './posts/posts.module';
import { NotificationModule } from './notification/notification.module';
import { TagsModule } from './tags/tags.module';
import { LikesModule } from './likes/likes.module';
import { CommentsModule } from './comments/comments.module';
import { FollowsModule } from './follows/follows.module';
@Module({
  imports: [UsersModule, PrismaModule, AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PostsModule,
    NotificationModule,
    TagsModule,
    LikesModule,
    CommentsModule,
    FollowsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
