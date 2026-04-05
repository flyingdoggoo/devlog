import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from '@prisma/prisma.module';
import { AuthModule } from '@authentication/auth.module';
import { PostsModule } from './posts/posts.module';
import { NotificationModule } from './notification/notification.module';
import { TagsModule } from './tags/tags.module';
import { LikesModule } from './likes/likes.module';
import { CommentsModule } from './comments/comments.module';
import { FollowsModule } from './follows/follows.module';
import { RedisCacheModule } from './cache/redis-cache.module';
import { SearchModule } from './search/search.module';
import { UploadsModule } from './uploads/uploads.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisCacheModule,
    UsersModule,
    AuthModule,
    PostsModule,
    NotificationModule,
    TagsModule,
    LikesModule,
    CommentsModule,
    FollowsModule,
    SearchModule,
    UploadsModule,
    BookmarksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
