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
  author: { select: { id: true, username: true, name: true, avatarUrl: true } },
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

  private estimateReadTimeMinutes(content: string) {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  private stripMarkdownToText(input: string) {
    return input
      .replace(/```[a-zA-Z0-9_-]*\n?/g, ' ')
      .replace(/```/g, ' ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^\s*>\s?/gm, '')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/(^|[\s(])(\*|_)([^*_]+)\2(?=[\s).,!?:;]|$)/g, '$1$3')
      .replace(/^\s*([-*_]\s*){3,}$/gm, '')
      .replace(/\r?\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private buildExcerpt(content: string, excerpt?: string) {
    const normalizedExcerpt = excerpt?.trim();
    const source = normalizedExcerpt || content;
    const plainText = this.stripMarkdownToText(source);

    if (!plainText) {
      return '';
    }

    const previewLength = 180;
    return plainText.length <= previewLength
      ? plainText
      : `${plainText.slice(0, previewLength).trimEnd()}...`;
  }

  private resolvePublishedAt(value?: string) {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  }

  async createPost(createPostDto: CreatePostDto, authorId: string) {
    const {
      title,
      content,
      tagIds,
      status,
      excerpt,
      coverImageUrl,
      publishedAt,
      readTimeMinutes,
    } = createPostDto;
    const slug = await this.generateSlug(title);

    return this.prisma.post.create({
      data: {
        title,
        content,
        excerpt: this.buildExcerpt(content, excerpt),
        coverImageUrl: coverImageUrl?.trim() ?? '',
        readTimeMinutes: readTimeMinutes ?? this.estimateReadTimeMinutes(content),
        authorId,
        slug,
        status: status ?? PostStatus.PUBLISHED,
        publishedAt: this.resolvePublishedAt(publishedAt),
        tags: tagIds?.length
          ? {
            create: tagIds.map(tagId => ({
              tag: {
                connect: { id: tagId }
              }
            }))
          }
          : undefined,
      },
      include: postInclude
    });
  }

  async findAllPosts(page = 1, limit = 10, userId?: string) {
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
          author: { select: { id: true, username: true, name: true, avatarUrl: true } },
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
              author: { select: { id: true, username: true, name: true, avatarUrl: true } },
            },
          },
          likes: userId ? {
            where: {
              active: true,
              userId: userId
            },
            take : 1,
          } : false,
          bookmarks: userId ? {
            where: {
              active: true,
              userId: userId,
            },
            take: 1,
          } : false,
        },
      })
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
      items: formattedItems,
      total,
      page: safePage,
      limit: safeLimit,
      hasMore: skip + items.length < total
    };    
  }

  async findPostBySlug(slug: string, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug, status: PostStatus.PUBLISHED },
      include: {
        ...postInclude,
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
    });

    if (!post) {
      return null;
    }

    const { likes, bookmarks, ...postData } = post;

    return {
      ...postData,
      isLikedByMe: Array.isArray(likes) && likes.length > 0,
      isBookmarkedByMe: Array.isArray(bookmarks) && bookmarks.length > 0,
    };
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
    const {
      title,
      content,
      tagIds,
      status,
      excerpt,
      coverImageUrl,
      publishedAt,
      readTimeMinutes,
    } = updatePostDto;

    const slug = title ? await this.generateSlug(title) : undefined;
    const resolvedReadTimeMinutes =
      typeof readTimeMinutes === 'number'
        ? readTimeMinutes
        : typeof content === 'string'
          ? this.estimateReadTimeMinutes(content)
          : undefined;

    const resolvedExcerpt =
      typeof excerpt === 'string'
        ? this.buildExcerpt(content ?? '', excerpt)
        : typeof content === 'string'
          ? this.buildExcerpt(content)
          : undefined;

    const resolvedPublishedAt =
      publishedAt === undefined
        ? undefined
        : this.resolvePublishedAt(publishedAt);

    return this.prisma.post.update({
      where: { id, authorId },
      data: {
        title,
        content,
        excerpt: resolvedExcerpt,
        coverImageUrl: coverImageUrl === undefined ? undefined : coverImageUrl.trim(),
        readTimeMinutes: resolvedReadTimeMinutes,
        status,
        publishedAt: resolvedPublishedAt,
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
