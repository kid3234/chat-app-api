/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendRequestService {
    constructor(private prisma:PrismaService){}

    async sendRequest(senderId:string,receiverUsername:string){
        const receiver = await this.prisma.user.findUnique({
            where:{
                username:receiverUsername
            }
        })

        if(!receiver) throw new NotFoundException('User not found');

        if (senderId === receiver.id) throw new BadRequestException('Cannot send request to yourself');

        const alreadySent = await this.prisma.friendRequest.findFirst({
            where:{
               senderId:senderId,
                receiverId:receiver.id
            }
        })

        if(alreadySent)throw new BadRequestException('Friend request already sent');

        return this.prisma.friendRequest.create({
            data:{
                senderId,
                receiverId:receiver.id
            }
        })
    }

    async respondToRequest(requestId:string,accept:boolean,userId:string){
        const request = await this.prisma.friendRequest.findUnique({
            where:{
                id:requestId
            }

        })

        if(!request || request.receiverId !== userId) throw new NotFoundException('Request not found');

        const updated = await this.prisma.friendRequest.update({
            where:{
                id:requestId
            },
            data:{
                status:accept ? 'ACCEPTED' :'REJECTED'
            }
        });

        if(accept){
            const [user1Id,user2Id] =request.senderId < request.receiverId ?[request.senderId,request.receiverId] : [request.receiverId,request.senderId];
            await this.prisma.chat.create({
                data:{
                    user1Id,
                    user2Id
                }
            })
        }

        return updated;
    }
}
