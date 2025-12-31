import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AuditLogInterceptor.name);

    constructor(private readonly prisma: PrismaService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, user, ip, headers } = request;

        // Only log mutating operations
        if (!['POST', 'PATCH', 'DELETE'].includes(method)) {
            return next.handle();
        }

        return next.handle().pipe(
            tap(async (data) => {
                try {
                    if (!user) return; // Don't log if no user (e.g., public registration might handle logging internally or skipped)

                    // Extract entity name from URL (simple heuristic)
                    // e.g. /api/v1/users/123 -> users
                    const pathParts = url.split('/').filter((p: string) => p);
                    // Assuming api/v1/ENTITY/ID structure
                    const entity = pathParts[2] || 'unknown';

                    // Extract entityId
                    // For DELETE/PATCH, it's usually in params: request.params.id
                    // For POST, it's usually in the response data: data.id
                    let entityId = request.params.id;

                    if (!entityId && data && data.id) {
                        entityId = data.id;
                    }
                    // Use standard structure if wrapped
                    if (!entityId && data && data.data && data.data.id) {
                        entityId = data.data.id;
                    }

                    if (!entityId) {
                        this.logger.warn(`Could not determine entityId for audit log: ${method} ${url}`);
                        return;
                    }

                    await this.prisma.auditLog.create({
                        data: {
                            userId: user.id,
                            action: method,
                            entity: entity,
                            entityId: String(entityId),
                            newValue: method !== 'DELETE' ? (data.data || data) : undefined, // Store new value if not delete
                            ipAddress: ip,
                            userAgent: headers['user-agent'],
                        },
                    });
                } catch (error) {
                    this.logger.error('Failed to create audit log', error.stack);
                    // We suppress the error so we don't fail the request just because logging failed
                }
            }),
        );
    }
}
