import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from '../dto/cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get(':userId')
    getCart(@Param('userId') userId: string) {
        return this.cartService.getCart(userId);
    }

    @Post(':userId/add')
    addItem(@Param('userId') userId: string, @Body() addToCartDto: AddToCartDto) {
        return this.cartService.addItem(userId, addToCartDto);
    }

    @Put(':userId/update/:productId')
    updateQuantity(
        @Param('userId') userId: string,
        @Param('productId') productId: string,
        @Body() updateDto: UpdateCartItemDto
    ) {
        return this.cartService.updateItemQuantity(userId, productId, updateDto);
    }

    @Delete(':userId/remove/:productId')
    removeItem(
        @Param('userId') userId: string,
        @Param('productId') productId: string
    ) {
        return this.cartService.removeItem(userId, productId);
    }

    @Delete(':userId/clear')
    clearCart(@Param('userId') userId: string) {
        return this.cartService.clearCart(userId);
    }
}
