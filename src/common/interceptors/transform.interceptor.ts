import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        return next.handle().pipe(
            map(data => {
                // If data already has the standard format, return as is
                if (data && typeof data === 'object' && 'success' in data) {
                    return data;
                }

                // Transform to standard response format
                return {
                    success: true,
                    data,
                    meta: {
                        timestamp: new Date().toISOString(),
                        path: request.url,
                    },
                };
            }),
        );
    }
}
