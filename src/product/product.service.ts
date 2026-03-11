import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const product = this.productRepository.create(createProductDto);
        return await this.productRepository.save(product);
    }

    async createBulk(createProductDtos: CreateProductDto[]): Promise<Product[]> {
        const products = this.productRepository.create(createProductDtos);
        return await this.productRepository.save(products);
    }

    async findAll(): Promise<Product[]> {
        return await this.productRepository.find();
    }

    async findAllFiltered(filters: { name?: string; category?: string; tag?: string }): Promise<Product[]> {
        const query = this.productRepository.createQueryBuilder('product');

        if (filters.name) {
            query.andWhere('product.name ILIKE :name', { name: `%${filters.name}%` });
        }

        if (filters.category && filters.category !== 'all') {
            query.andWhere('product.category = :category', { category: filters.category });
        }

        if (filters.tag) {
            switch (filters.tag) {
                case 'best_seller':
                    // For demo, we sort by ID or just return a subset. 
                    // In real app, join with order_items and count frequency.
                    query.orderBy('product.id', 'ASC').limit(10);
                    break;
                case 'fresh':
                    query.orderBy('product.created_at', 'DESC');
                    break;
                case 'under_99':
                    // Use a more robust cast to ensure string price is treated as numeric
                    query.andWhere('CAST(product.price AS FLOAT) < :price', { price: 99 });
                    break;
                case 'healthy':
                    query.andWhere('product.category IN (:...cats)', { cats: ['dairy', 'veggies'] });
                    break;
                case 'organic':
                    query.andWhere('product.category = :cat', { cat: 'veggies' });
                    break;
                case 'premium':
                    query.andWhere('CAST(product.price AS FLOAT) > :price', { price: 199 });
                    break;
                case 'combo':
                    query.andWhere('(product.name ILIKE :c1 OR product.name ILIKE :c2)', { c1: '%combo%', c2: '%buy 1%' });
                    break;
            }
        }

        return await query.getMany();
    }

    async search(searchTerm: string): Promise<Product[]> {
        return await this.productRepository.createQueryBuilder('product')
            .where('product.name ILIKE :search OR product.category ILIKE :search', { search: `%${searchTerm}%` })
            .getMany();
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.findOne(id);
        Object.assign(product, updateProductDto);
        return await this.productRepository.save(product);
    }

    async updateStock(id: string, stock: number): Promise<Product> {
        const product = await this.findOne(id);
        product.stock = stock;
        return await this.productRepository.save(product);
    }

    async remove(id: string): Promise<void> {
        const product = await this.findOne(id);
        await this.productRepository.remove(product);
    }
}
