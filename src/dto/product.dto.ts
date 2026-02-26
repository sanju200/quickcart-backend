export class CreateProductDto {
    category: string;
    name: string;
    price: string;
    weight: string;
    image: string;
}

export class UpdateProductDto {
    category?: string;
    name?: string;
    price?: string;
    weight?: string;
    image?: string;
}
