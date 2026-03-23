import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@authentication/guard/jwt.guard';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  @UseGuards(JwtAuthGuard)
  createTag(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.createTag(createTagDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  findAllTags() {
    return this.tagsService.findAllTags();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tag by ID' })
  findTagsById(@Param('id') id: string) {
    return this.tagsService.findTagsById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.updateTag(id, updateTagDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagsService.removeTag(id);
  }
}
