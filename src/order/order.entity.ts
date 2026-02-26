import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    BeforeInsert,
} from 'typeorm';
import { User } from '../user/user.entity.js';
import { OrderItem } from './order-item.entity.js';

export enum OrderStatus {
    PENDING = 'PENDING',
    PLACED = 'PLACED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class Order {
    @PrimaryColumn({ type: 'varchar', length: 50 })
    id: string;

    @BeforeInsert()
    generateId() {
        if (!this.id) {
            this.id = 'ord_' + Math.random().toString(36).substr(2, 9);
        }
    }

    @ManyToOne(() => User)
    user: User;

    @Column({ type: 'varchar', length: 150 })
    userName: string;

    @Column({ type: 'varchar', length: 150 })
    userEmail: string;

    @Column({ type: 'varchar', length: 15, nullable: true })
    userPhone: string;

    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items: OrderItem[];

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
}
