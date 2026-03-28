import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '@prisma/prisma.service';
import slugify from 'slugify';
import { PostStatus } from '@prisma/client';
const postInclude = {
  tags: {
    select: {
      tag: {
        select: { name: true }
      }
    }
  },
  author: { select: { id: true, name: true, avatarUrl: true } },
  _count: {
    select:
    {
      likes: { where: { active: true } },
      comments: { where: { active: true } }
    }
  }
}
@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) { }

  async createPost(createPostDto: CreatePostDto, authorId: string) {
    const { title, content, tagIds } = createPostDto;
    const slug = await this.generateSlug(title);
    return this.prisma.post.create({
      data: {
        title,
        content,
        authorId,
        slug,
        status: PostStatus.PUBLISHED,
        tags: {
          create: tagIds?.map(tagId => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        }
      },
      include: postInclude
    });
  }

  async findAllPosts(page = 1, limit = 10) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (safePage - 1) * safeLimit;
    const [total, items] = await Promise.all([
      this.prisma.post.count({ where: { status: PostStatus.PUBLISHED } }),
      this.prisma.post.findMany({
        where: { status: PostStatus.PUBLISHED },
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          ...postInclude,
          author: { select: { id: true, name: true, avatarUrl: true } },
          comments: {
            where: {
              active: true,
              parentId: null,
              author: { active: true },
            },
            orderBy: { createdAt: 'desc' },
            take: 2,
            select: {
              id: true,
              content: true,
              createdAt: true,
              author: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
        },
      })
    ]);
    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      hasMore: skip + items.length < total
    };
  }

  async findPostById(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: postInclude
    });
  }
  async generateSlug(title: string): Promise<string> {
    const base = slugify(title, { lower: true });
    let slug = base;
    let count = 1;

    while (await this.prisma.post.findUnique({ where: { slug } })) {
      slug = `${base}-${count}`;
      count++;
    }
    return slug;
  }
  async updatePost(id: string, updatePostDto: UpdatePostDto, authorId: string) {
    const { title, content, tagIds } = updatePostDto;
    const slug = title ? await this.generateSlug(title) : undefined;
    return this.prisma.post.update({
      where: { id, authorId },
      data: {
        title,
        content,
        slug,
        tags: tagIds ? {
          deleteMany: {},  // xóa hết tag cũ
          create: tagIds.map(tagId => ({
            tag: { connect: { id: tagId } }
          }))
        } : undefined      // không gửi tagIds → giữ nguyên tag cũ
      },
      include: postInclude
    });
  }

  async removePost(id: string, authorId: string) {
    const post = await this.prisma.post.findUnique({ where: { id, authorId } });
    if (!post)
      throw new NotFoundException('Post not found');
    return this.prisma.post.update({
      where: { id },
      data: { status: PostStatus.ARCHIVED },
    })
  }
}
