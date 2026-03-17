import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';
import { Category } from 'src/category/category.entity';

export class CreateProductDto {
    @IsString()
    categoryId: string;

    @IsOptional()
    @IsObject()
    category?: Category;

    @IsString()
    name: string;

    @IsNumber()
    price: number;

    @IsString()
    weight: string;

    @IsString()
    image: string;

    @IsOptional()
    @IsNumber()
    stock?: number;

    @IsOptional()
    @IsNumber()
    lowStockThreshold?: number;
}

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsString()
    weight?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsNumber()
    stock?: number;

    @IsOptional()
    @IsNumber()
    lowStockThreshold?: number;
}

