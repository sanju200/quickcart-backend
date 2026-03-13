import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './offer.entity';

@Injectable()
export class OfferService {
    constructor(
        @InjectRepository(Offer)
        private offerRepository: Repository<Offer>,
    ) { }

    findAll() {
        return this.offerRepository.find({ where: { isActive: true } });
    }

    findOne(id: string) {
        return this.offerRepository.findOne({ where: { id } });
    }

    async create(offerData: Partial<Offer>) {
        const offer = this.offerRepository.create(offerData);
        return this.offerRepository.save(offer);
    }

    async remove(id: string) {
        await this.offerRepository.delete(id);
    }
}
