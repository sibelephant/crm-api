import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityDto } from './create-activity.dto';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateActivityDto extends PartialType(CreateActivityDto) {
    @IsDateString()
    @IsOptional()
    completedAt?: string;
}
