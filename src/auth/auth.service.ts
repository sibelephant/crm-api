import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly MAX_FAILED_ATTEMPTS = 5;
    private readonly LOCK_TIME_MINUTES = 15;

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async register(dto: RegisterDto) {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                firstName: dto.firstName,
                lastName: dto.lastName,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            },
        });

        this.logger.log(`New user registered: ${user.email}`);

        return user;
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const minutesRemaining = Math.ceil(
                (user.lockedUntil.getTime() - Date.now()) / 60000,
            );
            throw new UnauthorizedException(
                `Account is locked. Try again in ${minutesRemaining} minutes`,
            );
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            // Increment failed attempts
            const failedAttempts = user.failedAttempts + 1;
            const updateData: any = { failedAttempts };

            // Lock account if max attempts reached
            if (failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
                updateData.lockedUntil = new Date(
                    Date.now() + this.LOCK_TIME_MINUTES * 60000,
                );
                this.logger.warn(`Account locked for user: ${user.email}`);
            }

            await this.prisma.user.update({
                where: { id: user.id },
                data: updateData,
            });

            throw new UnauthorizedException('Invalid credentials');
        }

        // Reset failed attempts on successful login
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                failedAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
            },
        });

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        // Save refresh token
        const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: hashedRefreshToken },
        });

        this.logger.log(`User logged in: ${user.email}`);

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: 3600,
            tokenType: 'Bearer',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        };
    }

    async refreshTokens(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret',
            });

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });

            if (!user || !user.refreshToken) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            const isRefreshTokenValid = await bcrypt.compare(
                refreshToken,
                user.refreshToken,
            );

            if (!isRefreshTokenValid) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            // Generate new tokens
            const tokens = await this.generateTokens(user.id, user.email, user.role);

            // Update refresh token
            const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
            await this.prisma.user.update({
                where: { id: user.id },
                data: { refreshToken: hashedRefreshToken },
            });

            return tokens;
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async logout(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });

        this.logger.log(`User logged out: ${userId}`);

        return { message: 'Logged out successfully' };
    }

    async getCurrentUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }

    private async generateTokens(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_SECRET') || 'default-secret',
                expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') || '1h') as any,
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret',
                expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d') as any,
            }),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }
}
