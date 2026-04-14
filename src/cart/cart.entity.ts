import {
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    OneToMany,
    Column,
    Index,
} from 'typeorm';
import { User } from '../user/user.entity';
import { CartItem } from './cart-item.entity.js';

@Entity('carts')
export class Cart {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;

    @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
    items: CartItem[];

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalPrice: number;
}
