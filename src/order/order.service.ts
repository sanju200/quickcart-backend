import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

        // Batch-load all products in a single query instead of N individual queries
        const productIds = items.map(i => i.productId);
        const products = await this.productRepository
            .createQueryBuilder('product')
            .where('product.id IN (:...ids)', { ids: productIds })
            .getMany();

        const productMap = new Map(products.map(p => [p.id, p]));

        const order = new Order();
        order.user = user;
        order.userName = createOrderDto.userName;
        order.userEmail = createOrderDto.userEmail;
        order.userPhone = createOrderDto.userPhone;
        order.address = createOrderDto.address;
        order.totalAmount = createOrderDto.totalAmount;
        order.status = OrderStatus.PLACED; // Default to placed on creation

        const orderItems: OrderItem[] = [];
        const productsToUpdate: Product[] = [];

        for (const itemDto of items) {
            const product = productMap.get(itemDto.productId);
            if (!product) {
                throw new NotFoundException(`Product with ID ${itemDto.productId} not found`);
            }

            // Check stock sufficiency
            if (product.stock < itemDto.quantity) {
                throw new BadRequestException(`Insufficient stock for product ${product.name}. Available: ${product.stock}`);
            }

            // Deduct stock (will batch-save below)
            product.stock -= itemDto.quantity;
            productsToUpdate.push(product);

            const orderItem = new OrderItem();
            orderItem.product = product;
            orderItem.productTitle = itemDto.productTitle;
            orderItem.productImage = itemDto.productImage;
            orderItem.quantity = itemDto.quantity;
            orderItem.price = itemDto.price;
            orderItem.totalAmount = itemDto.quantity * itemDto.price;
            orderItem.productId = itemDto.productId;
            orderItem.weight = product.weight;
            orderItem.categoryId = product.categoryId;
            orderItems.push(orderItem);
        }

        // Batch-save all stock updates in one operation
        await this.productRepository.save(productsToUpdate);

        order.items = orderItems;

        return this.orderRepository.save(order);
    }

    async findAll(page: number = 1, limit: number = 20): Promise<{ data: Order[]; total: number }> {
        const [data, total] = await this.orderRepository.findAndCount({
            select: {
                id: true,
                userName: true,
                userEmail: true,
                totalAmount: true,
                status: true,
                created_at: true,
            },
            relations: ['items', 'user'],
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: 'DESC' },
        });
        return { data, total };
    }

    async findAllFiltered(where: any, page: number = 1, limit: number = 20): Promise<{ data: Order[]; total: number }> {
        const [data, total] = await this.orderRepository.findAndCount({
            where,
            relations: ['items', 'items.product', 'items.category', 'user'],
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: 'DESC' },
        });
        return { data, total };
    }

    async findByUserId(userId: string, page: number = 1, limit: number = 10): Promise<{ data: Order[]; total: number }> {
        const [data, total] = await this.orderRepository.findAndCount({
            where: { user: { id: userId } },
            select: {
                id: true,
                totalAmount: true,
                status: true,
                created_at: true,
            },
            relations: ['items'],
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: 'DESC' },
        });
        return { data, total };
    }

    async findOne(id: string): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['items', 'items.product', 'items.category', 'user'],
        });
        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }

    async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
        const order = await this.findOne(id);

        // This generic update is now more restrictive for basic fields
        if (updateOrderDto.userName) order.userName = updateOrderDto.userName;
        if (updateOrderDto.userEmail) order.userEmail = updateOrderDto.userEmail;
        if (updateOrderDto.userPhone) order.userPhone = updateOrderDto.userPhone;
        if (updateOrderDto.address) order.address = updateOrderDto.address;

        return this.orderRepository.save(order);
    }

    async processOrder(id: string): Promise<Order> {
        const order = await this.findOne(id);
        this.validateStatusTransition(order.status, OrderStatus.PROCESSING);
        order.status = OrderStatus.PROCESSING;
        return this.orderRepository.save(order);
    }

    async handoverToLogistics(id: string, trackingNumber: string, courierName: string, assignedLogisticsId?: string): Promise<Order> {
        const order = await this.findOne(id);
        this.validateStatusTransition(order.status, OrderStatus.HANDED_OVER);

        order.status = OrderStatus.HANDED_OVER;
        order.trackingNumber = trackingNumber;
        order.courierName = courierName;
        if (assignedLogisticsId) {
            order.assignedLogisticsId = assignedLogisticsId;
        }
        order.shippedAt = new Date();

        return this.orderRepository.save(order);
    }

    async updateTransitStatus(id: string): Promise<Order> {
        const order = await this.findOne(id);
        this.validateStatusTransition(order.status, OrderStatus.IN_TRANSIT);
        order.status = OrderStatus.IN_TRANSIT;
        return this.orderRepository.save(order);
    }

    async markOutForDelivery(id: string, deliveryPartnerId: string): Promise<Order> {
        const order = await this.findOne(id);
        this.validateStatusTransition(order.status, OrderStatus.OUT_FOR_DELIVERY);

        order.status = OrderStatus.OUT_FOR_DELIVERY;
        order.assignedDeliveryPartnerId = deliveryPartnerId;

        return this.orderRepository.save(order);
    }

    async completeDelivery(id: string, proofOfDelivery: string): Promise<Order> {
        const order = await this.findOne(id);
        this.validateStatusTransition(order.status, OrderStatus.DELIVERED);

        order.status = OrderStatus.DELIVERED;
        order.proofOfDelivery = proofOfDelivery;
        order.deliveredAt = new Date();

        return this.orderRepository.save(order);
    }

    private validateStatusTransition(current: OrderStatus, target: OrderStatus) {
        const transitions: Record<OrderStatus, OrderStatus[]> = {
            [OrderStatus.PENDING]: [OrderStatus.PLACED, OrderStatus.CANCELLED],
            [OrderStatus.PLACED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
            [OrderStatus.PROCESSING]: [OrderStatus.HANDED_OVER, OrderStatus.CANCELLED],
            [OrderStatus.HANDED_OVER]: [OrderStatus.IN_TRANSIT, OrderStatus.OUT_FOR_DELIVERY],
            [OrderStatus.IN_TRANSIT]: [OrderStatus.OUT_FOR_DELIVERY],
            [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
            [OrderStatus.DELIVERED]: [],
            [OrderStatus.CANCELLED]: [],
        };

        if (!transitions[current]?.includes(target)) {
            throw new BadRequestException(`Cannot transition order from ${current} to ${target}`);
        }
    }

    async remove(id: string): Promise<void> {
        const result = await this.orderRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }
    }
}
