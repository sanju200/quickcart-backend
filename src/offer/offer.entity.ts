import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('offers')
export class Offer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ unique: true })
    code: string;

    @Column({ type: 'enum', enum: ['percentage', 'fixed'] })
    discountType: 'percentage' | 'fixed';

    @Column('decimal')
    discountValue: number;

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'timestamp', nullable: true })
    expiresAt: Date;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    imageUrl: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
