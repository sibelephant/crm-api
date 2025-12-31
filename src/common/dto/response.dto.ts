export class ResponseDto<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    meta: {
        timestamp: string;
        pagination?: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
        path?: string;
    };
}
