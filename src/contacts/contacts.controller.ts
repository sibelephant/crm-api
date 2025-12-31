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
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) { }

  @Post()
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.contactsService.findAll(page, limit, status, companyId);
  }

  @Get(':id')
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Get(':id/activities')
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  getContactActivities(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.contactsService.getContactActivities(id, page, limit);
  }

  @Get(':id/deals')
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  getContactDeals(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.contactsService.getContactDeals(id, page, limit);
  }

  @Patch(':id')
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactsService.update(id, updateContactDto);
  }

  @Delete(':id')
  @Roles(Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }
}
