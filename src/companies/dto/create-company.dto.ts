import { IsString, IsNotEmpty, MaxLength, IsUrl, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
    @ApiProperty({ example: 'Acme Corp' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    name: string;

    @ApiProperty({ example: 'Technology', required: false })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    industry?: string;

    @ApiProperty({ example: 'https://example.com', required: false })
    @IsUrl()
    @IsOptional()
    website?: string;

    @ApiProperty({ example: '123 Main St', required: false })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    address?: string;

    @ApiProperty({ example: '+1-555-555-5555', required: false })
    @IsString()
    @IsOptional()
    @Matches(/^\+?[\d\s\-()]+$/, {
        message: 'Phone number must contain only numbers, spaces, hyphens, parentheses, and optionally a + prefix',
    })
    phone?: string;

    @ApiProperty({ example: 'Preferred supplier', required: false })
    @IsString()
    @IsOptional()
    notes?: string;
}
