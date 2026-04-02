import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsEmail, IsEnum, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../order/order.entity';
import { Category } from 'src/category/category.entity';

export class CreateOrderItemDto {
    @IsString()
    productId: string;

    @IsString()
    categoryId: string;

    @IsOptional()
    @IsObject()
    category?: Category;

    @IsString()
    productTitle: string;

    @IsString()
    productImage: string;

    @IsNumber()
    quantity: number;

    @IsNumber()
    price: number;
}

export class CreateOrderDto {
    @IsString()
    userId: string;

    @IsString()
    userName: string;

    @IsEmail()
    userEmail: string;

    @IsString()
    userPhone: string;

    @IsString()
    address: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];

    @IsNumber()
    totalAmount: number;
}

export class UpdateOrderDto {
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @IsOptional()
    @IsString()
    trackingNumber?: string;

    @IsOptional()
    @IsString()
    courierName?: string;

    @IsOptional()
    @IsString()
    proofOfDelivery?: string;

    @IsOptional()
    @IsString()
    assignedLogisticsId?: string;

    @IsOptional()
    @IsString()
    assignedDeliveryPartnerId?: string;

    @IsOptional()
    @IsString()
    userName?: string;

    @IsOptional()
    @IsEmail()
    userEmail?: string;

    @IsOptional()
    @IsString()
    userPhone?: string;

    @IsOptional()
    @IsString()
    address?: string;
}
