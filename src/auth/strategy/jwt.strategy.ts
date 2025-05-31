/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt'


@Injectable()
export class jwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService) {
         const secret = config.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in the environment');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret
        });
    }

    validate(payload: { sub: string, email: string, username: string }) {
        return {
            userId: payload.sub,
            email: payload.email,
            username: payload.username
        }
    }

}