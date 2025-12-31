import { IsEmail, IsString, MinLength, Matches, IsNotEmpty, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'StrongP@ssw0rd!', minLength: 8 })
    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)',
    })
    password: string;

    @ApiProperty({ example: 'John' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    lastName: string;

    @ApiProperty({ enum: Role, required: false, example: 'USER' })
    @IsEnum(Role)
    @IsOptional()
    role?: Role;
}
