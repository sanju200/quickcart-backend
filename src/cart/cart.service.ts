import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { User } from '../user/user.entity';
import { Product } from '../product/product.entity';
import { AddToCartDto, UpdateCartItemDto } from '../dto/cart.dto';

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(Cart)
        private cartRepository: Repository<Cart>,
        @InjectRepository(CartItem)
        private cartItemRepository: Repository<CartItem>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async getCart(userId: string): Promise<Cart> {
        let cart = await this.cartRepository.findOne({
            where: { user: { id: userId } },
            relations: ['items', 'items.product'],
        });

        if (!cart) {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new NotFoundException(`User with ID ${userId} not found`);
            }
            cart = this.cartRepository.create({ user, items: [], totalPrice: 0 });
            await this.cartRepository.save(cart);
        }

        return cart;
    }

    async addItem(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
        const { productId, quantity } = addToCartDto;
        const cart = await this.getCart(userId);
        const product = await this.productRepository.findOne({ where: { id: productId } });

        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        let cartItem = cart.items.find((item) => item.product.id === productId);

        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            cartItem = this.cartItemRepository.create({
                cart,
                product,
                quantity,
                price: parseFloat(product.price),
                subTotal: 0,
            });
            cart.items.push(cartItem);
        }

        cartItem.subTotal = cartItem.quantity * cartItem.price;
        await this.cartItemRepository.save(cartItem);

        return this.calculateAndUpdateTotal(cart.id);
    }

    async updateItemQuantity(userId: string, productId: string, updateDto: UpdateCartItemDto): Promise<Cart> {
        const cart = await this.getCart(userId);
        const cartItem = cart.items.find((item) => item.product.id === productId);

        if (!cartItem) {
            throw new NotFoundException(`Item with product ID ${productId} not found in cart`);
        }

        if (updateDto.quantity <= 0) {
            await this.cartItemRepository.remove(cartItem);
        } else {
            cartItem.quantity = updateDto.quantity;
            cartItem.subTotal = cartItem.quantity * cartItem.price;
            await this.cartItemRepository.save(cartItem);
        }

        return this.calculateAndUpdateTotal(cart.id);
    }

    async removeItem(userId: string, productId: string): Promise<Cart> {
        const cart = await this.getCart(userId);
        const cartItem = cart.items.find((item) => item.product.id === productId);

        if (!cartItem) {
            throw new NotFoundException(`Item with product ID ${productId} not found in cart`);
        }

        await this.cartItemRepository.remove(cartItem);
        return this.calculateAndUpdateTotal(cart.id);
    }

    async clearCart(userId: string): Promise<Cart> {
        const cart = await this.getCart(userId);
        console.log(`Clearing cart for user ${userId}. Items count: ${cart.items?.length || 0}`);

        if (cart.items && cart.items.length > 0) {
            await this.cartItemRepository.remove(cart.items);
            console.log(`Removed ${cart.items.length} items from cart ${cart.id}`);
        }

        cart.items = [];
        cart.totalPrice = 0;
        const savedCart = await this.cartRepository.save(cart);
        console.log(`Cart ${cart.id} saved with 0 items.`);
        return savedCart;
    }

    private async calculateAndUpdateTotal(cartId: string): Promise<Cart> {
        const cart = await this.cartRepository.findOne({
            where: { id: cartId },
            relations: ['items', 'items.product'],
        });

        if (!cart) throw new NotFoundException('Cart not found');

        cart.totalPrice = cart.items.reduce((total, item) => {
            return total + Number(item.subTotal);
        }, 0);

        return this.cartRepository.save(cart);
    }
}
