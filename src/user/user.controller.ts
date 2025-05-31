/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from 'src/auth/decorator';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    constructor(private userService: UserService) { }


    @Get()
    getByusername(@Query('username') qury: string) {
        return this.userService.getByusername(qury)
    }

    @Get(':email')
    getByEmail(@Param('email') email: string) {
        return this.userService.getByEmail(email)
    }

@Post('block')
blockUser(@Body() body: { blockedId: string }, @GetUser() user:{userId:string}) {
  return this.userService.blockUser(user.userId, body.blockedId);
}

@Post('report')
reportUser(@Body() body: { reportedId: string; reason: string }, @GetUser() user:{userId:string}) {
  return this.userService.reportUser(user.userId, body.reportedId, body.reason);
}

@Get('admin/reports')
getReports(){
    return this.userService.getAllReports();
}

}
