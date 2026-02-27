export class CreateUserDto {
    name: string;
    email: string;
    phone: string;
    password?: string;
    profile_pic_url?: string;
    addresses?: string;
}

export class UpdateUserDto {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    profile_pic_url?: string;
    is_verified?: boolean;
    addresses?: string;
}
