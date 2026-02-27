import { OrderStatus } from '../order/order.entity';

export class CreateOrderItemDto {
    productId: string;
    productTitle: string;
    productImage: string;
    quantity: number;
    price: number;
}

export class CreateOrderDto {
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    address: string;
    items: CreateOrderItemDto[];
    totalAmount: number;
}

export class UpdateOrderDto {
    status?: OrderStatus;
}
