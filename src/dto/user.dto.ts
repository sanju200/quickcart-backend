import { IsString, IsEmail, IsOptional, IsBoolean, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../user/user.entity';

export class AddressDto {
    @IsString()
    type: string;

    @IsString()
    streetAddress: string;

    @IsString()
    city: string;

    @IsString()
    state: string;

    @IsString()
    postalCode: string;

    @IsString()
    country: string;

    @IsBoolean()
    isSelected: boolean = false;
}

export class CreateUserDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsString()
    profile_pic_url?: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AddressDto)
    addresses?: AddressDto[];
}

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsString()
    profile_pic_url?: string;

    @IsOptional()
    @IsBoolean()
    is_verified?: boolean;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AddressDto)
    addresses?: AddressDto[];

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}
