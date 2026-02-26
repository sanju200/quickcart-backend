import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
} from 'typeorm';

@Entity('products')
export class Product {
    @PrimaryColumn({ type: 'varchar', length: 50 })
    id: string;

    @BeforeInsert()
    generateId() {
        if (!this.id) {
            this.id = 'p_' + Math.random().toString(36).substr(2, 9);
        }
    }

    @Column({ type: 'varchar', length: 100 })
    category: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 50 })
    price: string;

    @Column({ type: 'varchar', length: 50 })
    weight: string;

    @Column({ type: 'text' })
    image: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
}
