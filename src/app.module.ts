import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
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
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CategoryModule } from './category/category.module';
import { Category } from './category/category.entity';
import { OrderModule } from './order/order.module';
import { Order } from './order/order.entity';
import { OrderItem } from './order/order-item.entity';
import { CartModule } from './cart/cart.module';
import { Cart } from './cart/cart.entity';
import { CartItem } from './cart/cart-item.entity';
import { AdminModule } from './admin/admin.module';
import { OfferModule } from './offer/offer.module';
import { Offer } from './offer/offer.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 1000, // 60 seconds
      max: 100, // maximum number of items in cache
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('DB_HOST');
        const isAiven = host?.includes('aivencloud.com');
        const ssl = config.get<string>('DB_SSL') === 'true' || isAiven;

        return {
          type: 'postgres',
          host: host,
          port: parseInt(config.get<string>('DB_PORT') ?? '21331', 10),
          username: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASS'),
          database: config.get<string>('DB_NAME'),
          entities: [User, Product, Category, Order, OrderItem, Cart, CartItem, Offer],
          synchronize: true,
          ssl: ssl ? { rejectUnauthorized: false } : false,
          // Connection pool settings for faster query execution
          extra: {
            max: 20,
            connectionTimeoutMillis: 5000,
            idleTimeoutMillis: 10000
          },
          // Log slow queries (> 1 second) for debugging
          maxQueryExecutionTime: 1000,
          logging: ['error', 'warn'],
        };
      },
    }),
    UserModule,
    AuthModule,
    ProductModule,
    CategoryModule,
    OrderModule,
    CartModule,
    AdminModule,
    OfferModule,
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
export class AppModule {
  constructor(private configService: ConfigService) {
    console.log('AppModule constructor: DB_HOST =', this.configService.get('DB_HOST'));
  }
}
