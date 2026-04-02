import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { PostStatus } from '@prisma/client';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) { }
  async commentPost(postId: string, userId: string, createCommentDto: CreateCommentDto) {
    const { content, parentId } = createCommentDto;

    const post = await this.prisma.post.findFirst({
      where: { id: postId, status: PostStatus.PUBLISHED }
    });
    if (!post)
      throw new NotFoundException('Post not found');

    if(parentId){
      const parentComment = await this.prisma.comment.findFirst({
      where: { id: createCommentDto.parentId, active: true }
    });
      if (!parentComment)
        throw new NotFoundException('Parent comment not found');
      if(parentComment.postId !== postId){
        throw new NotFoundException('Parent comment not found');
      }
    }

    return this.prisma.comment.create({
      data: { postId, authorId: userId, content: content, parentId: parentId ?? null, active: true }
    });
  }

  async findAllComments(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId, status: PostStatus.PUBLISHED }
    });
    if (!post) throw new NotFoundException('Post not found');

    const allComments = await this.prisma.comment.findMany({
      where: {
        postId,
        active: true,
        author: { active: true }
      },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, username: true, name: true, avatarUrl: true } }
      }
    });

    const buildTree = (comments: typeof allComments, parentId: string | null = null) => {
      return comments
        .filter(c => c.parentId === parentId)
        .map(c => ({
          ...c,
          replies: buildTree(comments, c.id)
        }));
    };

    return buildTree(allComments);
  }

  async updateComment(commentId: string, userId: string, updateCommentDto: UpdateCommentDto) {
    const { content } = updateCommentDto;
    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        authorId: userId,
        active: true,
        author: {
          active: true
        }
      }
    })
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content: content }
    });
  }

  async removeComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        authorId: userId,
        active: true,
      }
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return this.prisma.comment.update({
      where: { id: commentId },
      data: { active: false }
    });
  }
}
