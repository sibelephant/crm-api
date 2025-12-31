import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully registered' })
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
    @ApiOperation({ summary: 'Login user' })
    @ApiResponse({ status: 200, description: 'Login successful' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refreshTokens(dto.refreshToken);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout user' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    @HttpCode(HttpStatus.OK)
    async logout(@CurrentUser() user: any) {
        return this.authService.logout(user.id);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'User profile returned' })
    async getCurrentUser(@CurrentUser() user: any) {
        return this.authService.getCurrentUser(user.id);
    }
}
