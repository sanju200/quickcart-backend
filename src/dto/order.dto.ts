import { OrderStatus } from '../order/order.entity';

export class CreateOrderItemDto {
    productId: string;
    productTitle: string;
    quantity: number;
    price: number;
}

export class CreateOrderDto {
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    items: CreateOrderItemDto[];
    totalAmount: number;
}

export class UpdateOrderDto {
    status?: OrderStatus;
}
