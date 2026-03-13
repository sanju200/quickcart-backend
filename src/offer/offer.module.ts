import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './offer.entity';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Offer])],
    providers: [OfferService],
    controllers: [OfferController],
    exports: [OfferService],
})
export class OfferModule { }
