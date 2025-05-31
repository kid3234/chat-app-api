/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Server } from 'socket.io';

@Injectable()
export class UserService {
    private server:Server
    constructor(private prisma: PrismaService) { }


    setServerInstance(server: Server) {
  this.server = server;
}
    async getByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                email
            }
        })

        if (!user) {
            throw new NotFoundException('user not found')
        }
        const { password, ...result } = user
        return result

    }

    async getByusername(query: string) {
        if (query || query.trim() == '') return [];

        const users = await this.prisma.user.findMany({
            where: {
                username: {
                    contains: query,
                    mode: 'insensitive'
                }
            },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true
            },
            take: 10,

        })

        return users
    }

    async blockUser(blockerId: string, blockedId: string) {
        if (blockerId === blockedId) throw new BadRequestException("Cann't block yourself");
        const block= await this.prisma.block.create({ data: { blockerId, blockedId } });

        this.server.to(`user:${blockedId}`).emit('user_blocked',{by:blockerId});

        return block
    }

    async reportUser(reporterId: string, reportedId: string, reason: string) {
        const report = await this.prisma.report.create({
            data: { reporterId, reportedId, reason }
        })

        this.server.to('admin_room').emit('new_report',{reporterId,reportedId,reason})
        return report;
    }

    async getAllReports(){
        return await this.prisma.report.findMany({
            include:{
                reporter:{select:{id:true,username:true}},
                reported:{select:{id:true,username:true}}
            },
            orderBy:{createdAt:'desc'}
        })
    }
}
