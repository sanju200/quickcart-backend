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

    @Column({ type: 'varchar', length: 100, nullable: true })
    category: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    title: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    icon: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    bgColor: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
}