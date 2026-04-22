import {
    Entity,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
} from 'typeorm';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    category: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    title: string;

    @Column({ type: 'varchar', length: 50, nullable: false })
    icon: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
}