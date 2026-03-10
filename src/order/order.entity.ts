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
    PROCESSING = 'PROCESSING',
    HANDED_OVER = 'HANDED_OVER',
    IN_TRANSIT = 'IN_TRANSIT',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
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

    @Column({ type: 'text', nullable: true })
    address: string;

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

    @Column({ type: 'varchar', length: 100, nullable: true })
    trackingNumber: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    courierName: string;

    @Column({ type: 'timestamp', nullable: true })
    shippedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    deliveredAt: Date;

    @Column({ type: 'text', nullable: true })
    proofOfDelivery: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    assignedLogisticsId: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    assignedDeliveryPartnerId: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
}
