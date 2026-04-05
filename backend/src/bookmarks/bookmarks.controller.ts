import { Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@authentication/guard/jwt.guard';
import { BookmarksService } from './bookmarks.service';

@ApiTags('bookmarks')
@Controller()
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post('posts/:postId/bookmarks')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Bookmark a post' })
  @ApiParam({
    name: 'postId',
    required: true,
    description: 'The ID of the post',
    example: 'd52186b2-ee1e-4f41-81e8-6e7787557a77',
  })
  bookmarkPost(@Param('postId') postId: string, @Req() req) {
    const userId = req.user.userId;
    return this.bookmarksService.bookmarkPost(postId, userId);
  }

  @Delete('posts/:postId/bookmarks')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove a post from bookmarks' })
  @ApiParam({
    name: 'postId',
    required: true,
    description: 'The ID of the post',
    example: 'd52186b2-ee1e-4f41-81e8-6e7787557a77',
  })
  unbookmarkPost(@Param('postId') postId: string, @Req() req) {
    const userId = req.user.userId;
    return this.bookmarksService.unbookmarkPost(postId, userId);
  }

  @Get('bookmarks/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all bookmarked posts for current user' })
  findMyBookmarkedPosts(@Req() req, @Query('page') page = '1', @Query('limit') limit = '10') {
    const userId = req.user.userId;
    return this.bookmarksService.findMyBookmarkedPosts(userId, Number(page), Number(limit));
  }
}
