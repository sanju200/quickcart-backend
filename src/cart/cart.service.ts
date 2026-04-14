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

    /**
     * Internal helper to get or create a cart without loading all relations.
     */
    private async getOrCreateCart(userId: string): Promise<Cart> {
        let cart = await this.cartRepository.findOne({
            where: { user: { id: userId } },
            select: ['id', 'totalPrice'],
        });

        if (!cart) {
            const user = await this.userRepository.findOne({ where: { id: userId }, select: ['id'] });
            if (!user) {
                throw new NotFoundException(`User with ID ${userId} not found`);
            }
            cart = this.cartRepository.create({ user, items: [], totalPrice: 0 });
            await this.cartRepository.save(cart);
        }

        return cart;
    }

    async getCart(userId: string): Promise<Cart> {
        const cart = await this.cartRepository.findOne({
            where: { user: { id: userId } },
            relations: ['items', 'items.product'],
        });

        if (!cart) {
            return this.getOrCreateCart(userId);
        }

        return cart;
    }

    async addItem(userId: string, addToCartDto: AddToCartDto): Promise<any> {
        const { productId, quantity } = addToCartDto;

        // 1. Fetch Cart and Product (Leaner Selects)
        const [cart, product] = await Promise.all([
            this.getOrCreateCart(userId),
            this.productRepository.findOne({
                where: { id: productId },
                select: ['id', 'price']
            })
        ]);

        if (!product) {
            throw new NotFoundException(`Product not found`);
        }

        // 2. Find or Create the specific item (Using composite index)
        let cartItem = await this.cartItemRepository.findOne({
            where: { cart: { id: cart.id }, product: { id: productId } }
        });

        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            cartItem = this.cartItemRepository.create({
                cart,
                product,
                quantity,
                price: Number(product.price),
                subTotal: 0,
            });
        }

        cartItem.subTotal = cartItem.quantity * Number(cartItem.price);
        await this.cartItemRepository.save(cartItem);

        // 3. Recalculate Total and Save
        await this.recalculateCartTotal(cart.id);

        // Fetch final values for the response
        const [updatedCart, cartCount] = await Promise.all([
            this.cartRepository.findOne({ where: { id: cart.id }, select: ['totalPrice'] }),
            this.cartItemRepository.count({ where: { cart: { id: cart.id } } })
        ]);

        return {
            message: 'Item added successfully',
            totalPrice: updatedCart?.totalPrice,
            cartCount: cartCount
        };
    }

    private async recalculateCartTotal(cartId: string): Promise<void> {
        const result = await this.cartItemRepository
            .createQueryBuilder('item')
            .select('SUM(item.subTotal)', 'total')
            .where('item.cartId = :cartId', { cartId })
            .getRawOne();

        const totalPrice = Number(result.total) || 0;
        await this.cartRepository.update(cartId, { totalPrice });
    }

    async updateItemQuantity(userId: string, productId: string, updateDto: UpdateCartItemDto): Promise<any> {
        const { quantity } = updateDto;

        // 1. Fetch Cart and Product (Leaner Selects)
        const [cart, product] = await Promise.all([
            this.getOrCreateCart(userId),
            this.productRepository.findOne({
                where: { id: productId },
                select: ['id', 'price']
            })
        ]);

        if (!product) {
            throw new NotFoundException(`Product not found`);
        }

        // 2. Find specific cart item
        let cartItem = await this.cartItemRepository.findOne({
            where: {
                cart: { id: cart.id },
                product: { id: productId }
            }
        });

        if (!cartItem) {
            // FALLBACK: If item not found, create it instead of failing
            if (quantity <= 0) return { message: 'Item already removed', totalPrice: cart.totalPrice };

            cartItem = this.cartItemRepository.create({
                cart,
                product,
                quantity,
                price: Number(product.price),
                subTotal: quantity * Number(product.price),
            });
        } else {
            if (quantity <= 0) {
                await this.cartItemRepository.remove(cartItem);
            } else {
                cartItem.quantity = quantity;
                cartItem.subTotal = cartItem.quantity * Number(cartItem.price);
            }
        }

        if (quantity > 0) {
            await this.cartItemRepository.save(cartItem);
        }

        // 3. Recalculate Total
        await this.recalculateCartTotal(cart.id);

        const [updatedCart, cartCount] = await Promise.all([
            this.cartRepository.findOne({ where: { id: cart.id }, select: ['totalPrice'] }),
            this.cartItemRepository.count({ where: { cart: { id: cart.id } } })
        ]);

        return {
            message: 'Cart updated successfully',
            totalPrice: updatedCart?.totalPrice,
            cartCount: cartCount
        };
    }

    async removeItem(userId: string, productId: string): Promise<any> {
        const cart = await this.getOrCreateCart(userId);
        const cartItem = await this.cartItemRepository.findOne({
            where: { cart: { id: cart.id }, product: { id: productId } },
            select: ['id']
        });

        if (!cartItem) return { message: 'Item already removed', totalPrice: cart.totalPrice };

        await this.cartItemRepository.remove(cartItem);

        // Recalculate
        await this.recalculateCartTotal(cart.id);

        const [updatedCart, cartCount] = await Promise.all([
            this.cartRepository.findOne({ where: { id: cart.id }, select: ['totalPrice'] }),
            this.cartItemRepository.count({ where: { cart: { id: cart.id } } })
        ]);

        return {
            message: 'Item removed successfully',
            totalPrice: updatedCart?.totalPrice,
            cartCount: cartCount
        };
    }

    async clearCart(userId: string): Promise<Cart> {
        const cart = await this.getOrCreateCart(userId);

        // Bulk delete all items for this cart
        await this.cartItemRepository.delete({ cart: { id: cart.id } });

        // Reset total
        cart.totalPrice = 0;
        cart.items = [];
        return this.cartRepository.save(cart);
    }

    /**
     * Recalculates total from the in-memory cart items and saves.
     * No extra DB fetch needed — reuses the cart already loaded by getCart().
     */
    private async calculateAndSaveTotal(cart: Cart): Promise<Cart> {
        cart.totalPrice = cart.items.reduce((total, item) => {
            return total + Number(item.subTotal);
        }, 0);

        return this.cartRepository.save(cart);
    }
}
