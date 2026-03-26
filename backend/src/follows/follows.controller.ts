import { Controller, Get, Post, Body, Delete, Req, UseGuards } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { JwtAuthGuard } from '@authentication/guard/jwt.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('follows')
@Controller('follows')
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post()
  async follow(@Body() dto: CreateFollowDto, @Req() req) {
    return this.followsService.follow(dto, req.user.userId);
  }

  @Delete()
  async unfollow(@Body() dto: CreateFollowDto, @Req() req) {
    return this.followsService.unfollow(dto, req.user.userId);
  }

  @Get('followers')
  async getFollowers(@Req() req) {
    return this.followsService.getAllFollowers(req.user.userId);
  }

  @Get('following')
  async getFollowings(@Req() req) {
    return this.followsService.getFollowings(req.user.userId);
  }
}
