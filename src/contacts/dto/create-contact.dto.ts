import {
    IsString,
    IsNotEmpty,
    MaxLength,
    IsEmail,
    IsOptional,
    Matches,
    IsEnum,
    IsUUID,
} from 'class-validator';
import { ContactStatus } from '@prisma/client';

export class CreateContactDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    lastName: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsOptional()
    @Matches(/^\+?[\d\s\-()]+$/, {
        message: 'Phone number must contain only numbers, spaces, hyphens, parentheses, and optionally a + prefix',
    })
    phone?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    title?: string;

    @IsEnum(ContactStatus)
    @IsOptional()
    status?: ContactStatus;

    @IsUUID()
    @IsOptional()
    companyId?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
