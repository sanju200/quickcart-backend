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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'pg-7b06847-quickcart.a.aivencloud.com'),
        port: parseInt(config.get('DB_PORT', '21331'), 10),
        username: config.get('DB_USER', 'avnadmin'),
        password: config.get('DB_PASS', 'AVNS_p_dn-nAYz5XR6unqhnl'),
        database: config.get('DB_NAME', 'defaultdb'),
        entities: [User, Product, Category, Order, OrderItem, Cart, CartItem, Offer],
        synchronize: true,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
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
