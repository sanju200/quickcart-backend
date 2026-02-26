import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

@Injectable()
export class UserService implements OnModuleInit {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async onModuleInit() {
        const defaultEmail = 'sanjivani.bhongade@kizora.com';
        const existingUser = await this.userRepository.findOne({ where: { email: defaultEmail } });

        if (!existingUser) {
            console.log('Seeding default user...');
            const hashedPassword = await bcrypt.hash('Kizora@123', 10);
            const defaultUser = this.userRepository.create({
                name: 'Sanjivani Bhongade',
                email: defaultEmail,
                phone: '1234567890', // placeholder phone
                password_hash: hashedPassword,
                is_verified: true,
            });
            await this.userRepository.save(defaultUser);
            console.log('Default user created.');
        }
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { password, ...userData } = createUserDto;
        let password_hash: string | null = null;
        if (password) {
            password_hash = await bcrypt.hash(password, 10);
        }
        const user = this.userRepository.create({
            ...userData,
            password_hash,
        });
        return this.userRepository.save(user);
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);
        const { password, ...userData } = updateUserDto;

        if (password) {
            user.password_hash = await bcrypt.hash(password, 10);
        }

        Object.assign(user, userData);
        return this.userRepository.save(user);
    }

    async remove(id: string): Promise<void> {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }
}
