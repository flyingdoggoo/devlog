import { Controller, Get, Post, Body, Delete, Req, UseGuards, Param } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { JwtAuthGuard } from '@authentication/guard/jwt.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('follows')
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async follow(@Body() dto: CreateFollowDto, @Req() req) {
    return this.followsService.follow(dto, req.user.userId);
  }

  @Delete(':followingId')
  @UseGuards(JwtAuthGuard)
  async unfollow(@Param('followingId') followingId: string, @Req() req) {
    return this.followsService.unfollow(followingId, req.user.userId);
  }

  @Get('followers')
  @UseGuards(JwtAuthGuard)
  async getFollowers(@Req() req) {
    return this.followsService.getAllFollowers(req.user.userId);
  }

  @Get('following')
  @UseGuards(JwtAuthGuard)
  async getFollowings(@Req() req) {
    return this.followsService.getFollowings(req.user.userId);
  }

  @Get('users/:userId/followers')
  async getFollowersByUserId(@Param('userId') userId: string) {
    return this.followsService.getFollowersByUserId(userId);
  }

  @Get('users/:userId/following')
  async getFollowingsByUserId(@Param('userId') userId: string) {
    return this.followsService.getFollowingsByUserId(userId);
  }
}
