import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@authentication/guard/jwt.guard';
import { OptionalJwtAuthGuard } from '@authentication/guard/optional-jwt.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @UseGuards(JwtAuthGuard)
  createPost(@Req() req, @Body() createPostDto: CreatePostDto) {
    const userId = req.user.userId;
    return this.postsService.createPost(createPostDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @UseGuards(OptionalJwtAuthGuard)
  findAllPosts(@Query('page') page = '1', @Query('limit') limit = '10', @Req() req?) {
    const userId = req?.user?.userId;
    return this.postsService.findAllPosts(Number(page), Number(limit), userId);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a post by slug' })
  @UseGuards(OptionalJwtAuthGuard)
  findPostBySlug(@Param('slug') slug: string, @Req() req?) {
    const userId = req?.user?.userId;
    return this.postsService.findPostBySlug(slug, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a post by ID' })
  updatePost(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @Req() req) {
    const userId = req.user.userId;
    return this.postsService.updatePost(id, updatePostDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post by ID' })
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId;
    return this.postsService.removePost(id, userId);
  }
}
