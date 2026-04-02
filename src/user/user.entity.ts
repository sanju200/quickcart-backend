import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    AfterLoad,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export interface Address {
    type: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isSelected: boolean;
}

export enum UserRole {
    USER = 'USER',
    INVENTORY_MANAGER = 'INVENTORY_MANAGER',
    LOGISTICS_PARTNER = 'LOGISTICS_PARTNER',
    DELIVERY_PARTNER = 'DELIVERY_PARTNER',
    ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    firstName: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    lastName: string | null;

    @Column({ type: 'varchar', length: 150, unique: true, nullable: true })
    email: string | null;

    @Column({ type: 'varchar', length: 15, unique: true, nullable: true })
    phone?: string | null;

    @Exclude()
    @Column({ type: 'text', nullable: true })
    password_hash: string | null;

    @Column({ type: 'text', nullable: true })
    profile_pic_url: string | null;

    @Column({ type: 'boolean', default: false })
    is_verified: boolean;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    @Column({ type: 'jsonb', nullable: true })
    addresses: Address[] | null;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @AfterLoad()
    normalizeAddressesAfterLoad() {
        if (!this.addresses || this.addresses.length === 0) {
            return;
        }

        let hasSelected = false;
        this.addresses = this.addresses.map((addr) => {
            const isSelected = !!addr.isSelected; // Ensure it's a boolean
            if (isSelected && !hasSelected) {
                hasSelected = true;
                return { ...addr, isSelected: true };
            }
            return { ...addr, isSelected: false };
        });

        // If no address was marked as selected, default the first one to true
        if (!hasSelected && this.addresses.length > 0) {
            this.addresses[0].isSelected = true;
        }
    }
}
