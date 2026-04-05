import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PostStatus } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

const bookmarkedPostInclude = {
  tags: {
    select: {
      tag: {
        select: { name: true },
      },
    },
  },
  author: { select: { id: true, username: true, name: true, avatarUrl: true } },
  _count: {
    select: {
      likes: { where: { active: true } },
      comments: { where: { active: true } },
    },
  },
};

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async bookmarkPost(postId: string, userId: string) {
    await this.ensureActiveUserAndPublishedPost(postId, userId);

    return this.prisma.bookmark.upsert({
      where: { postId_userId: { postId, userId } },
      create: { postId, userId, active: true },
      update: { active: true },
    });
  }

  async unbookmarkPost(postId: string, userId: string) {
    await this.ensureActiveUserAndPublishedPost(postId, userId);

    const bookmark = await this.prisma.bookmark.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    if (!bookmark.active) {
      throw new ConflictException('Post already removed from bookmarks');
    }

    return this.prisma.bookmark.update({
      where: { postId_userId: { postId, userId } },
      data: { active: false },
    });
  }

  async findMyBookmarkedPosts(userId: string, page = 1, limit = 10) {
    await this.ensureActiveUser(userId);

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (safePage - 1) * safeLimit;

    const where = {
      userId,
      active: true,
      post: { status: PostStatus.PUBLISHED },
    };

    const [total, bookmarks] = await Promise.all([
      this.prisma.bookmark.count({ where }),
      this.prisma.bookmark.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          post: {
            include: {
              ...bookmarkedPostInclude,
              likes: {
                where: {
                  active: true,
                  userId,
                },
                take: 1,
              },
              bookmarks: {
                where: {
                  active: true,
                  userId,
                },
                take: 1,
              },
            },
          },
        },
      }),
    ]);

    const items = bookmarks.map((bookmark) => {
      const { likes, bookmarks: bookmarkRows, ...postData } = bookmark.post;

      return {
        ...postData,
        isLikedByMe: likes.length > 0,
        isBookmarkedByMe: bookmarkRows.length > 0,
      };
    });

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      hasMore: skip + items.length < total,
    };
  }

  private async ensureActiveUserAndPublishedPost(postId: string, userId: string) {
    await Promise.all([this.ensurePublishedPost(postId), this.ensureActiveUser(userId)]);
  }

  private async ensurePublishedPost(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
        status: PostStatus.PUBLISHED,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }
  }

  private async ensureActiveUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        active: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }
}
