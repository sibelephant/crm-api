import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
            },
        });

        return new UserResponseDto(user);
    }

    async findAll(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where: { deletedAt: null },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({
                where: { deletedAt: null },
            }),
        ]);

        return {
            data: users.map((user) => new UserResponseDto(user)),
            meta: {
                pagination: {
                    page,
                    limit,
                    totalItems: total,
                    totalPages: Math.ceil(total / limit),
                    hasNextPage: page < Math.ceil(total / limit),
                    hasPrevPage: page > 1,
                },
            },
        };
    }

    async findOne(id: string): Promise<UserResponseDto> {
        const user = await this.prisma.user.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return new UserResponseDto(user);
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
        // Check if user exists
        const existingUser = await this.prisma.user.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });

        if (!existingUser) {
            throw new NotFoundException('User not found');
        }

        // Update user
        const user = await this.prisma.user.update({
            where: { id },
            data: updateUserDto,
        });

        return new UserResponseDto(user);
    }

    async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<UserResponseDto> {
        // Check if user exists
        const existingUser = await this.prisma.user.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });

        if (!existingUser) {
            throw new NotFoundException('User not found');
        }

        // Update role
        const user = await this.prisma.user.update({
            where: { id },
            data: { role: updateRoleDto.role },
        });

        return new UserResponseDto(user);
    }

    async remove(id: string): Promise<void> {
        // Check if user exists
        const existingUser = await this.prisma.user.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });

        if (!existingUser) {
            throw new NotFoundException('User not found');
        }

        // Prevent deleting the last SUPER_ADMIN
        if (existingUser.role === Role.SUPER_ADMIN) {
            const superAdminCount = await this.prisma.user.count({
                where: {
                    role: Role.SUPER_ADMIN,
                    deletedAt: null,
                },
            });

            if (superAdminCount <= 1) {
                throw new ForbiddenException('Cannot delete the last SUPER_ADMIN');
            }
        }

        // Soft delete user
        await this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
