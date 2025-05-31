/* eslint-disable prettier/prettier */
import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('friend-request')
export class FriendRequestController {
    constructor(private service: FriendRequestService) { }

    @Post('request')
    sendRequest(@Body('username') username: string, @GetUser() user: { userId: string }) {
        return this.service.sendRequest(user.userId, username)
    }

    @Post('respond/:id')
    respond(@Param('id') id: string, @Body('accept') accept: boolean, @GetUser() user: { userId: string }) {
        return this.service.respondToRequest(id, accept, user.userId)
    }
}
