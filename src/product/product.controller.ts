import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
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
        @Query('tag') tag?: string
    ) {
        if (search) {
            return this.productService.search(search);
        }
        if (name || category || tag) {
            return this.productService.findAllFiltered({ name, category, tag });
        }
        return this.productService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productService.update(id, updateProductDto);
    }

    @Put(':id/stock')
    updateStock(@Param('id') id: string, @Body('stock') stock: number) {
        return this.productService.updateStock(id, stock);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productService.remove(id);
    }
}
