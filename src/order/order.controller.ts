import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { OrderService } from './order.service.js';
import { OrderStatus } from './order.entity.js';
import { CreateOrderDto, UpdateOrderDto } from '../dto/order.dto.js';

@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post()
    create(@Body() createOrderDto: CreateOrderDto) {
        return this.orderService.create(createOrderDto);
    }

    @Get()
    findAll(
        @Query('status') status?: OrderStatus,
        @Query('assignedDeliveryPartnerId') deliveryPartnerId?: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20'
    ) {
        const where: any = {};
        if (status) where.status = status;
        if (deliveryPartnerId) where.assignedDeliveryPartnerId = deliveryPartnerId;

        return this.orderService.findAllFiltered(where, parseInt(page, 10), parseInt(limit, 10));
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.orderService.findOne(id);
    }

    @Get('user/:userId')
    findByUserId(
        @Param('userId') userId: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10'
    ) {
        return this.orderService.findByUserId(userId, parseInt(page, 10), parseInt(limit, 10));
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
        return this.orderService.update(id, updateOrderDto);
    }

    @Put(':id/process')
    process(@Param('id') id: string) {
        return this.orderService.processOrder(id);
    }

    @Put(':id/handover')
    handover(
        @Param('id') id: string,
        @Body() data: { trackingNumber: string; courierName: string; assignedLogisticsId?: string }
    ) {
        return this.orderService.handoverToLogistics(id, data.trackingNumber, data.courierName, data.assignedLogisticsId);
    }

    @Put(':id/transit')
    transit(@Param('id') id: string) {
        return this.orderService.updateTransitStatus(id);
    }

    @Put(':id/out-for-delivery')
    outForDelivery(
        @Param('id') id: string,
        @Body('deliveryPartnerId') deliveryPartnerId: string
    ) {
        return this.orderService.markOutForDelivery(id, deliveryPartnerId);
    }

    @Put(':id/delivered')
    delivered(
        @Param('id') id: string,
        @Body('proofOfDelivery') proofOfDelivery: string
    ) {
        return this.orderService.completeDelivery(id, proofOfDelivery);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.orderService.remove(id);
    }
}
