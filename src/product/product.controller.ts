import { Controller, Get, Post, Body, Param, Put, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';

@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post()
    create(@Body() createProductDto: CreateProductDto) {
        return this.productService.create(createProductDto);
    }

    @Post('bulk')
    createBulk(@Body() createProductDtos: CreateProductDto[]) {
        return this.productService.createBulk(createProductDtos);
    }

    @Get()
    findAll(
        @Query('search') search?: string,
        @Query('name') name?: string,
        @Query('category') category?: string,
        @Query('categoryId') categoryId?: string,
        @Query('tag') tag?: string
    ) {
        if (search) {
            return this.productService.search(search);
        }
        if (name || category || categoryId || tag) {
            return this.productService.findAllFiltered({ name, categoryId: categoryId || category, tag });
        }
        return this.productService.findAll();
    }

    @Get('category/:categoryId')
    getProductsByCategory(@Param('categoryId', ParseUUIDPipe) categoryId: string) {
        return this.productService.findByCategoryId(categoryId);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.productService.findOne(id);
    }

    @Put(':id')
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productService.update(id, updateProductDto);
    }

    @Put(':id/stock')
    updateStock(@Param('id', ParseUUIDPipe) id: string, @Body('stock') stock: number) {
        return this.productService.updateStock(id, stock);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.productService.remove(id);
    }
}
