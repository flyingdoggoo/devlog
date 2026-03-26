import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '@authentication/guard/jwt.guard';
import { ApiParam } from '@nestjs/swagger';
@ApiParam({
  name: 'postId',
  required: true,
  description: 'The ID of the post',
  example: 'd52186b2-ee1e-4f41-81e8-6e7787557a77'
})
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  commentPost(@Param('postId') postId: string, @Body() dto: CreateCommentDto, @Req() req) {
    const userId = req.user.userId;
    return this.commentsService.commentPost(postId, userId, dto);
  }

  @Get()
  findAllComments(@Param('postId') postId: string) {
    return this.commentsService.findAllComments(postId);
  }

  @Patch(':commentId')
  @UseGuards(JwtAuthGuard)
  updateComment(@Param('commentId') commentId: string, @Body() updateCommentDto: UpdateCommentDto, @Req() req) {
    const userId = req.user.userId;
    return this.commentsService.updateComment(commentId, userId, updateCommentDto);
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  removeComment(@Param('commentId') commentId: string, @Req() req) {
    const userId = req.user.userId;
    return this.commentsService.removeComment(commentId, userId);
  }
}
