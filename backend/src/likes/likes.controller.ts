import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '@authentication/guard/jwt.guard';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
@ApiParam({
  name: 'postId',
  required: true,
  description: 'The ID of the post',
  example: 'd52186b2-ee1e-4f41-81e8-6e7787557a77'
})
@Controller('posts/:postId/likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new like' })
  async likePost(@Param('postId') postId: string, @Req() req) {
    const userId = req.user.userId;
    return this.likesService.likePost(postId, userId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'unlike a post' })
  async unlikePost(@Param('postId') postId: string, @Req() req) {
    const userId = req.user.userId;
    return this.likesService.unlikePost(postId, userId);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users who liked a post' })
  async findAllUsersWhoLikedPost(@Param('postId') postId: string) {
    return this.likesService.findAllUsersWhoLikedPost(postId);
  }

}
