/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket,Server } from 'socket.io';
import { MessageService } from '../message/message.service';
import { PrismaService } from '../prisma/prisma.service';
import { MediaType } from 'generated/prisma';
import { UserService } from 'src/user/user.service';

interface JwtPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}


@WebSocketGateway({
  cors:{
    origin:'*',
  },
})

export class ChatGateway implements OnGatewayConnection,OnGatewayDisconnect ,OnGatewayInit{
   @WebSocketServer()
  server: Server;
  private onlineUsers = new Map<string,string>()
constructor(private jwt:JwtService,private config:ConfigService,private messageService:MessageService,private prisma:PrismaService,private readonly userService:UserService){}
afterInit(server: Server) {
    this.userService.setServerInstance(server)
}

async handleConnection(socket:Socket){
  try{
    const token = socket.handshake.auth?.token;
    const payload = await this.jwt.verifyAsync(token,{
      secret:this.config.get('JWT_SECRET'),
    });
   (socket.data.user as JwtPayload) = payload;
    this.onlineUsers.set(payload.sub,socket.id)

    socket.join(`user:${payload.sub}`);
    console.log(`user ${payload.username} connected`);

    this.broadcastStatus(payload.sub,true)
    
  }catch(err){
    console.log('Socket connection rejected: ',err.message);
    socket.disconnect();
  }
}

handleDisconnect(socket: Socket) {
  const user = socket.data.user;
  if(user){
    this.onlineUsers.delete(user.sub);
    this.broadcastStatus(user.sub,false);
    this.prisma.user.update({
      where:{id:user.sub},
      data:{lastSeen: new Date()},
    })
    
  }
  console.log(`user ${socket.data?.user?.username} disconnected`); 
}

private broadcastStatus(userId:string,isOnline:boolean){
  const statusPayload ={
    userId,
    isOnline
  }


  for(const [_, sockId] of this.onlineUsers){
    const socket = this.server?.sockets?.sockets.get(sockId);
    socket?.emit('user_status_change',statusPayload)
  }
}

@SubscribeMessage('send_message')
 async handleSendMessage(@ConnectedSocket() socket:Socket,@MessageBody() body:{recipientId:string,text:string},){
  const sender = socket.data.user;

  const isBlocked = await this.prisma.block.findFirst({
    where:{
      blockerId:body.recipientId,
      blockedId:sender.sub
    }
  })

  if(isBlocked){
    socket.emit('message_error',{error:'you are blocked by this user.'});
    return
  }

  const saved  = await this.messageService.saveMessage(  sender.sub,
      body.recipientId,
      body.text,)

  socket.to(`user:${body.recipientId}`).emit('receive_message',saved)

  socket.emit('message_sent',saved);
}

@SubscribeMessage('typing')
handleTyping(@ConnectedSocket() socket:Socket,@MessageBody() data:{recipientId:string}){
  const sender = socket.data.user;
  socket.to(`user:${data.recipientId}`).emit('typing',{
    from:sender.sub,
    username:sender.username
  })
}

@SubscribeMessage('mark_delivered')
async handleMarkDelivered(@MessageBody() body:{messageId:string}){
  await this.messageService.markDelivered(body.messageId)
}

@SubscribeMessage('mark_seen')
async handleMarkSeen(@MessageBody() body:{messegeId:string}){
  await this.messageService.markAsSeen(body.messegeId)
}

@SubscribeMessage('send_media')
async handleSendMedia(@ConnectedSocket() socket:Socket,@MessageBody() body:{recipientId:string,mediaUrl:string,mediaType:MediaType,text?:string}){
  const sender = socket.data.user
  const saved = await this.messageService.saveMediaMessage(sender.sub,body.recipientId,body.mediaUrl,body.mediaType,body.text ?? '');
   socket.to(`user:${body.recipientId}`).emit('receive_message', saved);
  socket.emit('message_sent', saved);
}

}
