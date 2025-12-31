import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    ParseIntPipe,
    DefaultValuePipe,
    HttpCode,
    HttpStatus,
    Request,
    ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    @ApiOperation({ summary: 'Create a new user (Admin only)' })
    @ApiResponse({ status: 201, description: 'User successfully created' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get all users (Admin only)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Return all users' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    ) {
        return this.usersService.findAll(page, limit);
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER, Role.USER)
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({ status: 200, description: 'User found' })
    @ApiResponse({ status: 404, description: 'User not found' })
    findOne(@Param('id') id: string, @Request() req: any) {
        // Users can only view their own profile unless they are ADMIN or SUPER_ADMIN
        if (
            req.user.role !== Role.ADMIN &&
            req.user.role !== Role.SUPER_ADMIN &&
            req.user.id !== id
        ) {
            throw new ForbiddenException('You can only view your own profile');
        }

        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER, Role.USER)
    @ApiOperation({ summary: 'Update user profile' })
    @ApiResponse({ status: 200, description: 'User updated' })
    update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Request() req: any,
    ) {
        // Users can only update their own profile unless they are ADMIN or SUPER_ADMIN
        if (
            req.user.role !== Role.ADMIN &&
            req.user.role !== Role.SUPER_ADMIN &&
            req.user.id !== id
        ) {
            throw new ForbiddenException('You can only update your own profile');
        }

        return this.usersService.update(id, updateUserDto);
    }

    @Patch(':id/role')
    @Roles(Role.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update user role (Super Admin only)' })
    @ApiResponse({ status: 200, description: 'Role updated' })
    updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
        return this.usersService.updateRole(id, updateRoleDto);
    }

    @Delete(':id')
    @Roles(Role.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Soft delete user (Super Admin only)' })
    @ApiResponse({ status: 204, description: 'User deleted' })
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
