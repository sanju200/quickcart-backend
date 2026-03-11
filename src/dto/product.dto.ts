import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateProductDto {
    @IsString()
    categoryId: string;

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
}

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    categoryId?: string;

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
}
