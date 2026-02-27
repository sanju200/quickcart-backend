import {
    Entity,
    PrimaryColumn,
    Column,
    ManyToOne,
    BeforeInsert,
} from 'typeorm';
import { Order } from './order.entity.js';
import { Product } from '../product/product.entity.js';

@Entity('order_items')
export class OrderItem {
    @PrimaryColumn({ type: 'varchar', length: 50 })
    id: string;

    @BeforeInsert()
    generateId() {
        if (!this.id) {
            this.id = 'ord_item_' + Math.random().toString(36).substr(2, 9);
        }
    }

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    order: Order;

    @ManyToOne(() => Product)
    product: Product;

    @Column({ type: 'varchar', length: 255 })
    productTitle: string; // snapshots title in case product info changes

    @Column({ type: 'text', nullable: true })
    productImage: string; // snapshot image URL

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number; // snapshot price at time of order

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;
}
