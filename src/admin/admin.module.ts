import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';
import { OrderModule } from '../order/order.module';
import { ProductModule } from '../product/product.module';
import { User } from '../user/user.entity';
import { Order } from '../order/order.entity';
import { Product } from '../product/product.entity';

@Module({
    imports: [
        UserModule,
        OrderModule,
        ProductModule,
        TypeOrmModule.forFeature([User, Order, Product]),
    ],
    controllers: [AdminController],
})
export class AdminModule { }
