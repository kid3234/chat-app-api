/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetUser = createParamDecorator(((data:unknown,ctx :ExecutionContext)=>{
    const request:Express.Request = ctx.switchToHttp().getRequest();
    return request.user;
}))