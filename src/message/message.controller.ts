/* eslint-disable prettier/prettier */
import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard)
@Controller('message')
export class MessageController {
    constructor(private messageService:MessageService){}

    @Get(':userId')
 getMessages(@Param('userId') userId:string,@GetUser() user:{userId:string}){
        return  this.messageService.getMessageBetweenUsers(user.userId,userId)
    }

    @Get('recent')
    getRecentChats(@GetUser() user:{userId:string}){
        return this.messageService.getRecentChats(user.userId)
    }

    @Delete(':id')
    deleteMessage(@Param('id') id:string,@GetUser() user:{userId:string}){
        return this.messageService.deleteMessage(id,user.userId)
    }
}
