import {
    IsString,
    IsNotEmpty,
    MaxLength,
    IsNumber,
    Min,
    Max,
    IsEnum,
    IsOptional,
    IsInt,
    IsDateString,
    IsUUID,
} from 'class-validator';
import { DealStage } from '@prisma/client';

export class CreateDealDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @IsNumber()
    @Min(0)
    @Max(999999999999.99)
    amount: number;

    @IsEnum(DealStage)
    @IsOptional()
    stage?: DealStage;

    @IsInt()
    @Min(0)
    @Max(100)
    @IsOptional()
    probability?: number;

    @IsDateString()
    @IsOptional()
    expectedCloseDate?: string;

    @IsUUID()
    @IsOptional()
    contactId?: string;

    @IsUUID()
    @IsOptional()
    companyId?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
