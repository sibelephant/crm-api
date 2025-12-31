import { Role } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;

    @Exclude()
    password: string;

    @Exclude()
    refreshToken: string | null;

    @Exclude()
    failedAttempts: number;

    @Exclude()
    lockedUntil: Date | null;

    @Exclude()
    deletedAt: Date | null;

    constructor(partial: Partial<UserResponseDto>) {
        Object.assign(this, partial);
    }
}
