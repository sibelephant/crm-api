export class PaginationDto {
    page?: number = 1;
    limit?: number = 20;
    sort?: string = 'createdAt';
    order?: 'asc' | 'desc' = 'desc';
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
