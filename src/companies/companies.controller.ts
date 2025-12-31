import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Companies')
@ApiBearerAuth()
@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) { }

  @Post()
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a company' })
  @ApiResponse({ status: 201, description: 'Company created' })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List companies' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return paginated companies' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.companiesService.findAll(page, limit);
  }

  @Get(':id')
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiResponse({ status: 200, description: 'Company found' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Get(':id/contacts')
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get contacts for a company' })
  @ApiResponse({ status: 200, description: 'Return paginated contacts' })
  getCompanyContacts(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.companiesService.getCompanyContacts(id, page, limit);
  }

  @Get(':id/deals')
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get deals for a company' })
  @ApiResponse({ status: 200, description: 'Return paginated deals' })
  getCompanyDeals(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.companiesService.getCompanyDeals(id, page, limit);
  }

  @Patch(':id')
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update company' })
  @ApiResponse({ status: 200, description: 'Company updated' })
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @Roles(Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Soft delete company (Manager+)' })
  @ApiResponse({ status: 204, description: 'Company deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
