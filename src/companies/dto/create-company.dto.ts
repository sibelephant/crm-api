import { IsString, IsNotEmpty, MaxLength, IsUrl, IsOptional, Matches } from 'class-validator';

export class CreateCompanyDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    industry?: string;

    @IsUrl()
    @IsOptional()
    website?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    address?: string;

    @IsString()
    @IsOptional()
    @Matches(/^\+?[\d\s\-()]+$/, {
        message: 'Phone number must contain only numbers, spaces, hyphens, parentheses, and optionally a + prefix',
    })
    phone?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
