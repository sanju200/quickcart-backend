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
    ) {
        const where: any = {};
        if (status) where.status = status;
        if (deliveryPartnerId) where.assignedDeliveryPartnerId = deliveryPartnerId;

        // Note: Using find instead of Service method directly if simple, 
        // but let's assume we want to extend the service method instead
        return this.orderService.findAllFiltered(where);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.orderService.findOne(id);
    }

    @Get('user/:userId')
    findByUserId(@Param('userId') userId: string) {
        return this.orderService.findByUserId(userId);
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
        @Body() data: { trackingNumber: string; courierName: string }
    ) {
        return this.orderService.handoverToLogistics(id, data.trackingNumber, data.courierName);
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
