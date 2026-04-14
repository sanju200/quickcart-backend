import { Controller, Get, Post, Body, Param, Put, Delete, ParseUUIDPipe, UseInterceptors } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';
import { Public } from '../auth/public.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoryService.create(createCategoryDto);
    }

    @Post('bulk')
    createBulk(@Body() createCategoryDtos: CreateCategoryDto[]) {
        return this.categoryService.createBulk(createCategoryDtos);
    }

    @UseInterceptors(CacheInterceptor)
    @Public()
    @Get()
    findAll() {
        return this.categoryService.findAll();
    }

    @Public()
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.categoryService.findOne(id);
    }

    @Put(':id')
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoryService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.categoryService.remove(id);
    }
}
