import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateProductDto {
    @IsString()
    category: string;

    @IsString()
    name: string;

    @IsString()
    price: string;

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
    category?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    price?: string;

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
