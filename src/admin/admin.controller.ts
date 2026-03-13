import { Controller, Get, UseGuards, Patch, Param, Body, Delete, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { OrderService } from '../order/order.service';
import { ProductService } from '../product/product.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
    constructor(
        private userService: UserService,
        private orderService: OrderService,
        private productService: ProductService,
    ) { }

    @Get('stats')
    async getStats() {
        const users = await this.userService.findAll();
        const orders = await this.orderService.findAll();
        const products = await this.productService.findAll();

        const totalRevenue = orders
            .filter(o => o.status === 'DELIVERED')
            .reduce((sum, o) => sum + Number(o.totalAmount), 0);

        const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
        const lowStockItems = products.filter(p => p.stock < 10).length;

        return {
            totalRevenue,
            activeOrders: orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length,
            totalUsers: users.length,
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
        const products = await this.productService.findAll();
        return products.filter(p => p.stock < 10);
    }

    @Get('partners')
    async getPartners() {
        const users = await this.userService.findAll();
        return users.filter(u =>
            u.role === UserRole.DELIVERY_PARTNER ||
            u.role === UserRole.LOGISTICS_PARTNER
        );
    }

    @Get('commission-stats')
    async getCommissionStats() {
        const orders = await this.orderService.findAll();
        const delivered = orders.filter(o => o.status === 'DELIVERED');

        // Demo calculation
        const platformCommission = delivered.reduce((sum, o) => sum + (Number(o.totalAmount) * 0.05), 0);
        const deliveryCommission = delivered.reduce((sum, o) => sum + (Number(o.totalAmount) * 0.10), 0);

        return {
            totalCommission: platformCommission + deliveryCommission,
            platformRevenue: platformCommission,
            partnerEarnings: deliveryCommission,
            orderCount: delivered.length,
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
