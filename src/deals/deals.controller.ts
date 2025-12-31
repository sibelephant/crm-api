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
  Request,
} from '@nestjs/common';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('deals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DealsController {
  constructor(private readonly dealsService: DealsService) { }

  @Post()
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  create(@Body() createDealDto: CreateDealDto, @Request() req: any) {
    return this.dealsService.create(createDealDto, req.user.id);
  }

  @Get()
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('stage') stage?: string,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.dealsService.findAll(page, limit, stage, ownerId);
  }

  @Get('pipeline')
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  getPipelineSummary() {
    return this.dealsService.getPipelineSummary();
  }

  @Get(':id')
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.dealsService.findOne(id);
  }

  @Get(':id/activities')
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  getDealActivities(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.dealsService.getDealActivities(id, page, limit);
  }

  @Patch(':id')
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() updateDealDto: UpdateDealDto) {
    return this.dealsService.update(id, updateDealDto);
  }

  @Patch(':id/stage')
  @Roles(Role.USER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  updateStage(@Param('id') id: string, @Body() updateStageDto: UpdateStageDto) {
    return this.dealsService.updateStage(id, updateStageDto);
  }

  @Delete(':id')
  @Roles(Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.dealsService.remove(id);
  }
}
