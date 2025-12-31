import {
    IsString,
    IsNotEmpty,
    MaxLength,
    IsEnum,
    IsOptional,
    IsDateString,
    IsUUID,
} from 'class-validator';
import { ActivityType } from '@prisma/client';

export class CreateActivityDto {
    @IsEnum(ActivityType)
    type: ActivityType;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    subject: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @IsUUID()
    @IsOptional()
    contactId?: string;

    @IsUUID()
    @IsOptional()
    dealId?: string;
}
