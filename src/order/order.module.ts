import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './order.entity.js';
import { OrderItem } from './order-item.entity.js';
import { User } from '../user/user.entity';
import { Product } from '../product/product.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, OrderItem, User, Product]),
    ],
    controllers: [OrderController],
    providers: [OrderService],
})
export class OrderModule { }
