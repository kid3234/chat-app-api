/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { FriendRequestModule } from './friend-request/friend-request.module';
import { ChatGateway } from './chat/chat.gateway';
import { MessageModule } from './message/message.module';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true
  }),AuthModule, UserModule, PrismaModule, FriendRequestModule, MessageModule],
  providers: [ChatGateway],
})
export class AppModule {}
