/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtStrategy } from './strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports:[JwtModule.register({}),ConfigModule.forRoot({
    isGlobal:true
  })],
  controllers: [AuthController],
  providers: [AuthService,jwtStrategy],
})
export class AuthModule {}
