import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { User } from './user/user.entity';
import { Product } from './product/product.entity';
import { ProductModule } from './product/product.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard.js';
import { CategoryModule } from './category/category.module.js';
import { Category } from './category/category.entity.js';
import { OrderModule } from './order/order.module.js';
import { Order } from './order/order.entity.js';
import { OrderItem } from './order/order-item.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USER', 'root'),
        password: config.get('DB_PASS', 'root'),
        database: config.get('DB_NAME', 'quickcart'),
        entities: [User, Product, Category, Order, OrderItem],
        synchronize: true, // enabled to automatically create the products table
      }),
    }),
    UserModule,
    AuthModule,
    ProductModule,
    CategoryModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
