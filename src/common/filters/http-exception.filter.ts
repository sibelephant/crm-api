import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let code = 'INTERNAL_ERROR';
        let details: any = undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object') {
                const responseObj = exceptionResponse as any;
                message = responseObj.message || exception.message;
                code = responseObj.error || this.getErrorCode(status);
                details = responseObj.details || responseObj.message;
            } else {
                message = exceptionResponse as string;
                code = this.getErrorCode(status);
            }
        } else if (exception instanceof Error) {
            message = exception.message;
            this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
        }

        response.status(status).json({
            success: false,
            error: {
                code,
                message,
                details,
            },
            meta: {
                timestamp: new Date().toISOString(),
                path: request.url,
            },
        });
    }

    private getErrorCode(status: number): string {
        const errorCodes: Record<number, string> = {
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            422: 'UNPROCESSABLE_ENTITY',
            429: 'TOO_MANY_REQUESTS',
            500: 'INTERNAL_ERROR',
        };

        return errorCodes[status] || 'UNKNOWN_ERROR';
    }
}
