import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
// import { JwtAuthGuard } from '@authentication/guard/jwt.guard';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
    constructor(private searchService: SearchService) { }

    @Get()
    @ApiOperation({ summary: 'Search posts, users, tags' })
    @ApiQuery({ name: 'q', required: true, type: String })
    @ApiQuery({ name: 'type', required: false, enum: ['posts', 'users', 'tags'] })
    @ApiQuery({
        name: 'filters',
        required: false,
        type: String,
        description: 'dev.to style alias: class_name:User | class_name:Tag',
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    search(
        @Query('q') query = '',
        @Query('type') type = 'posts',
        @Query('filters') filters = '',
        @Query('page') page = 1,
        @Query('limit') limit = 20,
    ) {
        return this.searchService.search({ q: query, type, filters, page: Number(page), limit: Number(limit) });        
    }
}
