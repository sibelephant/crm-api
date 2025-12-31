import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsEnum, Min, Max } from 'class-validator';

export class PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @IsOptional()
    @IsString()
    sort?: string = 'createdAt';

    @IsOptional()
    @IsEnum(['asc', 'desc'])
    order?: 'asc' | 'desc' = 'desc';

    @IsOptional()
    @IsString()
    search?: string;
}

export class PaginationMetaDto {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
