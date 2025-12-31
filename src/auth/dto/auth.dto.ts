import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
    Matches,
    IsNotEmpty,
} from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)',
    })
    password: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    lastName: string;
}

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class RefreshTokenDto {
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}
