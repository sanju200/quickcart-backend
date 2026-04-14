import { Controller, Get, UseGuards, Patch, Param, Body, Delete, Request, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { OrderService } from '../order/order.service';
import { ProductService } from '../product/product.service';
import { Order } from '../order/order.entity';
import { Product } from '../product/product.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
    constructor(
        private userService: UserService,
        private orderService: OrderService,
        private productService: ProductService,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    @Get('stats')
    async getStats() {
        // Consolidate 5 network round-trips into ONE single database call
        const stats = await this.orderRepository.query(`
            SELECT 
                (SELECT COUNT(*)::int FROM users) as "totalUsers",
                (SELECT COALESCE(SUM("totalAmount"), 0)::float FROM orders WHERE status = 'DELIVERED') as "totalRevenue",
                (SELECT COUNT(*)::int FROM orders WHERE status IN ('PLACED', 'PROCESSING', 'HANDED_OVER', 'IN_TRANSIT', 'OUT_FOR_DELIVERY')) as "activeOrders",
                (SELECT COUNT(*)::int FROM orders WHERE status = 'PENDING') as "pendingOrders",
                (SELECT COUNT(*)::int FROM products WHERE stock < "lowStockThreshold") as "lowStockItems"
        `);

        const { totalRevenue, activeOrders, totalUsers, pendingOrders, lowStockItems } = stats[0];

        return {
            totalRevenue,
            activeOrders,
            totalUsers,
            pendingOrders,
            lowStockItems,
        };
    }

    @Get('orders')
    async getAllOrders() {
        return this.orderService.findAll();
    }

    @Get('low-stock')
    async getLowStockItems() {
        // Use a query instead of loading all products and filtering in JS
        return this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .where('product.stock < product.lowStockThreshold')
            .getMany();
    }

    @Get('partners')
    async getPartners() {
        // Query only partners directly instead of loading all users
        return this.userRepository.find({
            where: [
                { role: UserRole.DELIVERY_PARTNER },
                { role: UserRole.LOGISTICS_PARTNER },
            ],
        });
    }

    @Get('commission-stats')
    async getCommissionStats() {
        // Use aggregate query instead of loading all orders
        const result = await this.orderRepository
            .createQueryBuilder('order')
            .select('COALESCE(SUM(order.totalAmount), 0)', 'totalRevenue')
            .addSelect('COUNT(order.id)', 'orderCount')
            .where('order.status = :status', { status: 'DELIVERED' })
            .getRawOne();

        const totalRevenue = Number(result.totalRevenue);
        const orderCount = Number(result.orderCount);

        return {
            totalCommission: totalRevenue * 0.15,
            platformRevenue: totalRevenue * 0.05,
            partnerEarnings: totalRevenue * 0.10,
            orderCount,
        };
    }

    @Get('users')
    async getAllUsers() {
        return this.userService.findAll();
    }

    @Patch('users/:id/role')
    async updateUserRole(@Param('id') id: string, @Body('role') role: UserRole) {
        return this.userService.update(id, { role } as any);
    }

    @Delete('users/:id')
    async deleteUser(@Request() req, @Param('id') id: string) {
        if (req.user.userId === id) {
            throw new BadRequestException('You cannot delete your own account.');
        }
        await this.userService.remove(id);
        return { message: 'User deleted successfully' };
    }
}
