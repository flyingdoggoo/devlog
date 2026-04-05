import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PostStatus } from '@prisma/client';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PrismaService } from '@prisma/prisma.service';

const postByTagInclude = {
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
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTag(createTagDto: CreateTagDto) {
    const { name } = createTagDto;
    const existing = await this.prisma.tag.findUnique({ where: { name } });
    if (existing) throw new ConflictException(`Tag "${name}" already exists`);
    return this.prisma.tag.create({
      data: {
        name,
      },
    });    
  }

  async findAllTags() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findTagsById(id: string) {
    return this.prisma.tag.findUnique({ where: { id } });
  }

  async findPostsByTagId(tagId: string, page = 1, limit = 10, userId?: string) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (safePage - 1) * safeLimit;

    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
      select: { id: true, name: true },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    const where = {
      status: PostStatus.PUBLISHED,
      tags: {
        some: {
          tagId,
        },
      },
    };

    const [total, items] = await Promise.all([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          ...postByTagInclude,
          likes: userId
            ? {
                where: {
                  active: true,
                  userId,
                },
                take: 1,
              }
            : false,
          bookmarks: userId
            ? {
                where: {
                  active: true,
                  userId,
                },
                take: 1,
              }
            : false,
        },
      }),
    ]);

    const formattedItems = items.map((post) => {
      const { likes, bookmarks, ...postData } = post;

      return {
        ...postData,
        isLikedByMe: Array.isArray(likes) && likes.length > 0,
        isBookmarkedByMe: Array.isArray(bookmarks) && bookmarks.length > 0,
      };
    });

    return {
      tag,
      items: formattedItems,
      total,
      page: safePage,
      limit: safeLimit,
      hasMore: skip + formattedItems.length < total,
    };
  }

  async updateTag(id: string, updateTagDto: UpdateTagDto) {
    const { name } = updateTagDto;
    const existing = await this.prisma.tag.findUnique({ where: { name } });
    if (existing && existing.id !== id) {
      throw new ConflictException(`Tag "${name}" already exists`);
    }
    return this.prisma.tag.update({
      where: { id },
      data: { name },
    });
  }

  async removeTag(id: string) {
    return this.prisma.tag.delete({ where: { id } });
  }
}
