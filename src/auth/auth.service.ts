/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto';
import * as bcrypt from 'bcrypt'
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) { }

    async create(dto: CreateUserDto) {


        const exist = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: dto.email }, { username: dto.username }]
            }
        })

        if (exist) {
            throw new BadRequestException('Email or username alredy exists');

        }

        const hashedPassword = await bcrypt.hash(dto.password, 10)

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                username: dto.username,
                password: hashedPassword,
            },
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user

        return result

    }

    async login(dto: LoginDto) {
        const exists = await this.prisma.user.findUnique({
            where: {
                username: dto.username
            }


        })

        if (!exists) {
            throw new UnauthorizedException('Invalid credentials')
        }

        const passMatch = await bcrypt.compare(dto.password, exists.password)

        if (!passMatch) {
            throw new UnauthorizedException('Invalid credentials')
        }

        return this.signToken(exists.id, exists.email, exists.username)

    }

    async signToken(userId: string, email: string, username: string) {
        const data = {
            sub: userId,
            email,
            username
        }

        const token = await this.jwt.signAsync(data, {
            expiresIn: '7d',
            secret: this.config.get("JWT_SECRET")
        })

        return {
            access_token: token,
            user:{
                id:userId,
                email,
                username
            }
        }
    }


}
