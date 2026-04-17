import { IsString, IsOptional, IsNumber, IsObject, IsNotEmpty } from 'class-validator';
import { Category } from 'src/category/category.entity';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @IsOptional()
    @IsObject()
    category?: Category;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsOptional()
    @IsString()
    weight?: string;

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

