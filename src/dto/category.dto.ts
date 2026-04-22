import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    category: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    icon: string;

}

export class UpdateCategoryDto {
    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    icon?: string;

}
