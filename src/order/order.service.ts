import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity.js';
import { OrderItem } from './order-item.entity.js';
import { CreateOrderDto, UpdateOrderDto } from '../dto/order.dto.js';
import { User } from '../user/user.entity.js';
import { Product } from '../product/product.entity.js';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemRepository: Repository<OrderItem>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async create(createOrderDto: CreateOrderDto): Promise<Order> {
        const { userId, items, ...orderData } = createOrderDto;

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const order = new Order();
        order.user = user;
        order.userName = createOrderDto.userName;
        order.userEmail = createOrderDto.userEmail;
        order.userPhone = createOrderDto.userPhone;
        order.totalAmount = createOrderDto.totalAmount;
        order.status = OrderStatus.PLACED; // Default to placed on creation

        const orderItems: OrderItem[] = [];

        for (const itemDto of items) {
            const product = await this.productRepository.findOne({ where: { id: itemDto.productId } });
            if (!product) {
                throw new NotFoundException(`Product with ID ${itemDto.productId} not found`);
            }

            const orderItem = new OrderItem();
            orderItem.product = product;
            orderItem.productTitle = itemDto.productTitle;
            orderItem.quantity = itemDto.quantity;
            orderItem.price = itemDto.price;
            orderItem.totalAmount = itemDto.quantity * itemDto.price;
            orderItems.push(orderItem);
        }

        order.items = orderItems;

        return this.orderRepository.save(order);
    }

    async findAll(): Promise<Order[]> {
        return this.orderRepository.find({
            relations: ['items', 'user'],
            order: { created_at: 'DESC' },
        });
    }

    async findByUserId(userId: string): Promise<Order[]> {
        return this.orderRepository.find({
            where: { user: { id: userId } },
            relations: ['items'],
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['items', 'user'],
        });
        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }

    async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
        const order = await this.findOne(id);
        if (updateOrderDto.status) {
            order.status = updateOrderDto.status;
        }
        return this.orderRepository.save(order);
    }

    async remove(id: string): Promise<void> {
        const result = await this.orderRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }
    }
}
