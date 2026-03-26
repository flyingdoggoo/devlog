import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PostStatus } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) { }

  async likePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId, status: PostStatus.PUBLISHED }
    });
    if (!post)
      throw new NotFoundException('Post not found');
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        active: true
      }
    });
    if (!user)
      throw new NotFoundException('User not found');
    const like = await this.prisma.like.upsert({
      where: { postId_userId: { postId, userId } },
      create: { postId, userId, active: true },
      update: { active: true }
    });
    return like;
  }
  async unlikePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId, status: PostStatus.PUBLISHED }
    });
    if (!post)
      throw new NotFoundException('Post not found');
    const user = await this.prisma.user.findUnique({
      where: { id: userId, active: true }
    });
    if (!user)
      throw new NotFoundException('User not found');

    const like = await this.prisma.like.findUnique({
      where: { postId_userId: { postId, userId } }
    });
    if (!like)
      throw new NotFoundException('Like not found');
    if(!like.active)
      throw new ConflictException('Post already unliked');
    return this.prisma.like.update({
      where: { postId_userId: { postId, userId } },
      data: { active: false }
    });
  }

  async findAllUsersWhoLikedPost(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId, status: PostStatus.PUBLISHED }
    });
    if (!post)
      throw new NotFoundException('Post not found');
    return this.prisma.like.findMany({
      where: {
        postId,
        active: true,
        user: { active: true }
      },
      include: { user: { select: { id: true, name: true } } }
    });
  }
}
