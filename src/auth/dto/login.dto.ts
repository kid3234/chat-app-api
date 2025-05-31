/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty } from "class-validator";

export class LoginDto{
    @IsNotEmpty()
    username:string;

    @IsNotEmpty()
    password:string

}