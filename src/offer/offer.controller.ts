import { Controller, Get, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { OfferService } from './offer.service';
import { Offer } from './offer.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/user.entity';

@Controller('offer')
export class OfferController {
    constructor(private readonly offerService: OfferService) { }

    @Get()
    findAll(): Promise<Offer[]> {
        return this.offerService.findAll();
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    create(@Body() offerData: Partial<Offer>): Promise<Offer> {
        return this.offerService.create(offerData);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string): Promise<void> {
        return this.offerService.remove(id);
    }
}
