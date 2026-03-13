import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';
import { OrderModule } from '../order/order.module';
import { ProductModule } from '../product/product.module';

@Module({
    imports: [UserModule, OrderModule, ProductModule],
    controllers: [AdminController],
})
export class AdminModule { }
