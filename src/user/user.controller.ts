import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe, UseGuards, Request, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { User } from './user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Request() req): Promise<User> {
        return this.userService.findOne(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Put('me')
    updateMe(
        @Request() req,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<User> {
        return this.userService.update(req.user.userId, updateUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
        return this.userService.findOne(id);
    }

    @Post()
    create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.userService.create(createUserDto);
    }

    @Put(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<User> {
        return this.userService.update(id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.userService.remove(id);
    }
}
