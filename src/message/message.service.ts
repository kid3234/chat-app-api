/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { MediaType } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessageService {
    constructor(private prisma:PrismaService){}

    async saveMessage(senderId:string,recipientId:string,text:string){
        return await this.prisma.message.create({
            data:{
                senderId,
                recipientId,
                text
            }
        })
    }

    async getMessageBetweenUsers(user1Id:string,user2Id:string){
        return await this.prisma.message.findMany({
            where:{
                deleted: false,
                OR:[{senderId:user1Id,recipientId:user2Id},{senderId:user2Id,recipientId:user1Id}]
            },
            orderBy:{
                createdAt:'asc'
            }

        })
    }

    async markDelivered (messageId:string){
        return await this.prisma.message.update({
            where:{id:messageId,deleted: false,},
            data:{delivered:true}
        })
    }

    async markAsSeen (messageId:string){
        return await this.prisma.message.update({
            where:{
                deleted: false,
                id:messageId
            },
            data:{
                seen:true
            }
        })
    }

    async getRecentChats(userId:string){
        return await this.prisma.message.findMany({
            where:{
                deleted: false,
                OR:[
                    {senderId:userId},{recipientId:userId}
                ]
            },
            orderBy:{createdAt:'asc'},
            distinct:['senderId','recipientId'],
            take:20,
            include:{
                sender:true,
                recipient:true
            }
            
        })
    }

    async deleteMessage(messageId:string,userId:string){
        const message = await this.prisma.message.findUnique({where:{id:messageId}});
        if(!message || message.senderId !== userId) throw new ForbiddenException();

        return this.prisma.message.update({
  where: { id: messageId },
  data: { deleted: true }
});
    }

    async saveMediaMessage(senderId:string,recipientId:string,mediaUrl:string,mediaType:MediaType,text:string ){
        return await this.prisma.message.create({
            data:{
                senderId,
                recipientId,
                mediaType,
                mediaUrl,
                text
            }
        })
    }
    
}
