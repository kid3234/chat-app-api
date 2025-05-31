/* eslint-disable prettier/prettier */
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService:AuthService){}

    @Post()
    signup(@Body() dto:CreateUserDto){
        return this.authService.create(dto)
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() dto:LoginDto){
        return this.authService.login(dto)
    }
}
