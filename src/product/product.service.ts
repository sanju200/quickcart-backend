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
        const { category, ...productData } = createProductDto;
        const product = this.productRepository.create(productData);
        return await this.productRepository.save(product);
    }

    async createBulk(createProductDtos: CreateProductDto[]): Promise<Product[]> {
        const productData = createProductDtos.map(({ category, ...rest }) => rest);
        const products = this.productRepository.create(productData);
        return await this.productRepository.save(products);
    }

    async findAll(page: number = 1, limit: number = 20): Promise<{ data: Product[]; total: number }> {
        const [data, total] = await this.productRepository.findAndCount({
            select: ['id', 'name', 'price', 'image', 'stock', 'categoryId', 'created_at'],
            relations: ['category'],
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: 'DESC' },
        });
        return { data, total };
    }

    async findAllFiltered(filters: { name?: string; categoryId?: string; tag?: string; page?: number; limit?: number }): Promise<{ data: Product[]; total: number }> {
        const page = filters.page || 1;
        const limit = filters.limit || 20;

        const query = this.productRepository.createQueryBuilder('product')
            .leftJoin('product.category', 'category')
            .select([
                'product.id',
                'product.name',
                'product.price',
                'product.image',
                'product.stock',
                'product.categoryId',
                'product.created_at',
                'category.id',
                'category.category',
                'category.title'
            ]);

        if (filters.name) {
            query.andWhere('product.name ILIKE :name', { name: `%${filters.name}%` });
        }

        if (filters.categoryId && filters.categoryId !== 'all') {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(filters.categoryId)) {
                query.andWhere('product.categoryId = :categoryId', { categoryId: filters.categoryId });
            } else {
                query.andWhere('category.category = :categoryName', { categoryName: filters.categoryId });
            }
        }

        if (filters.tag) {
            switch (filters.tag) {
                case 'best_seller':
                    query.orderBy('product.id', 'ASC').limit(10);
                    break;
                case 'fresh':
                    query.orderBy('product.created_at', 'DESC');
                    break;
                case 'under_99':
                    query.andWhere('product.price < :price', { price: 99 });
                    break;
                case 'healthy':
                    query.andWhere('category.category IN (:...cats)', { cats: ['dairy', 'veggies'] });
                    break;
                case 'organic':
                    query.andWhere('category.category = :cat', { cat: 'veggies' });
                    break;
                case 'premium':
                    query.andWhere('product.price > :price', { price: 199 });
                    break;
                case 'combo':
                    query.andWhere('(product.name ILIKE :c1 OR product.name ILIKE :c2)', { c1: '%combo%', c2: '%buy 1%' });
                    break;
            }
        }

        query
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('product.created_at', 'DESC');

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async findByCategoryId(categoryId: string): Promise<Product[]> {
        return await this.productRepository.find({
            where: { categoryId },
            relations: ['category'],
        });
    }

    async search(searchTerm: string): Promise<Product[]> {
        return await this.productRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .where('product.name ILIKE :search OR category.category ILIKE :search OR category.title ILIKE :search', { search: `%${searchTerm}%` })
            .getMany();
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productRepository.findOne({ where: { id }, relations: ['category'] });
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

    async updateThreshold(id: string, threshold: number): Promise<Product> {
        const product = await this.findOne(id);
        product.lowStockThreshold = threshold;
        return await this.productRepository.save(product);
    }

    async remove(id: string): Promise<void> {
        const product = await this.findOne(id);
        await this.productRepository.remove(product);
    }
}
