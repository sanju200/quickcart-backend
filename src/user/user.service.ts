import { Injectable, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

@Injectable()
export class UserService implements OnModuleInit {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async onModuleInit() {
        const defaultEmail = 'sanjivanibhongade2001@gmail.com';
        const existingUser = await this.userRepository.findOne({ where: { email: defaultEmail } });

        if (!existingUser) {
            console.log('Seeding default user...');
            const hashedPassword = await bcrypt.hash('Kizora@123', 10);
            const defaultUser = this.userRepository.create({
                firstName: 'Sanjivani',
                lastName: 'Bhongade',
                email: defaultEmail,
                phone: '1234567890',
                password_hash: hashedPassword,
                is_verified: true,
                role: UserRole.ADMIN,
            });
            await this.userRepository.save(defaultUser);
            console.log('Default user created.');
        } else if (existingUser.role !== UserRole.ADMIN) {
            console.log('Updating existing default user to ADMIN role...');
            existingUser.role = UserRole.ADMIN;
            await this.userRepository.save(existingUser);
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
        const { password, addresses, ...userData } = createUserDto;

        // Check if email already exists
        const existingEmail = await this.findByEmail(userData.email);
        if (existingEmail) {
            throw new BadRequestException('This email is already registered. Please use a different email.');
        }

        // Check if phone already exists if provided
        if (userData.phone) {
            const existingPhone = await this.userRepository.findOne({ where: { phone: userData.phone } });
            if (existingPhone) {
                throw new BadRequestException('This phone number is already registered. Please use a different phone number.');
            }
        }

        let password_hash: string | null = null;
        if (password) {
            password_hash = await bcrypt.hash(password, 10);
        }

        const normalizedAddresses = this.normalizeAddresses(addresses);

        const user = this.userRepository.create({
            ...userData,
            password_hash,
            addresses: normalizedAddresses,
        });

        try {
            return await this.userRepository.save(user);
        } catch (error) {
            console.error('Error creating user:', error);
            throw new BadRequestException(`Failed to create user: ${error.message}`);
        }
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);
        const { password, addresses, ...userData } = updateUserDto;

        // 1. Parallelize data processing and DB checks
        const tasks: Promise<any>[] = [];

        // Only hash if password actually changed (CPU intensive)
        if (password) {
            tasks.push(bcrypt.hash(password, 10).then(hash => user.password_hash = hash));
        }

        // Only check email if it's different (Network intensive)
        if (userData.email && userData.email !== user.email) {
            tasks.push(this.findByEmail(userData.email).then(emailExists => {
                if (emailExists) throw new BadRequestException('This email is already registered.');
            }));
        }

        // Only check phone if it's different
        if (userData.phone && userData.phone !== user.phone) {
            tasks.push(this.userRepository.findOne({ where: { phone: userData.phone } }).then(phoneExists => {
                if (phoneExists) throw new BadRequestException('This phone number is already registered.');
            }));
        }

        // Wait for all checks to complete in parallel (one network round-trip instead of three)
        await Promise.all(tasks);

        if (addresses) {
            user.addresses = this.normalizeAddresses(addresses);
        }

        const dataToAssign = { ...userData };
        if (dataToAssign.name) {
            const parts = dataToAssign.name.trim().split(/\s+/);
            user.firstName = parts[0];
            user.lastName = parts.slice(1).join(' ') || '';
            delete (dataToAssign as any).name;
        }

        Object.assign(user, dataToAssign);
        return this.userRepository.save(user);
    }

    private normalizeAddresses(addresses: any[] | undefined): any[] | null {
        if (!addresses || addresses.length === 0) return null;

        let hasSelected = false;
        const normalized = addresses.map((addr) => {
            if (addr.isSelected && !hasSelected) {
                hasSelected = true;
                return { ...addr, isSelected: true };
            }
            return { ...addr, isSelected: false };
        });

        // If no address was marked as selected, default the first one to true
        if (!hasSelected && normalized.length > 0) {
            normalized[0].isSelected = true;
        }

        return normalized;
    }

    async remove(id: string): Promise<void> {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }
}
