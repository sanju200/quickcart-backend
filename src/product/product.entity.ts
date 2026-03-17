import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Category } from '../category/category.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: true, name: 'categoryId' })
    categoryId: string;

    @ManyToOne(() => Category)
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'float', default: 0 })
    price: number;

    @Column({ type: 'varchar', length: 50 })
    weight: string;

    @Column({ type: 'text' })
    image: string;

    @Column({ type: 'int', default: 0 })
    stock: number;

    @Column({ type: 'int', default: 5 })
    lowStockThreshold: number;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
}
