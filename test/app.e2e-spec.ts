/* eslint-disable prettier/prettier */
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum'
import { CreateUserDto } from '../src/auth/dto';
import { LoginDto } from '../src/auth/dto/login.dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;


  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true
      })
    )
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService)

    await prisma.cleanDb()
    pactum.request.setBaseUrl('http://localhost:3333',)

  });
  afterAll(async () => {
    await app.close();
  })

  describe('Auth', () => {
    const dto1: CreateUserDto = {
      email: 'kid@gmail.com',
      username: 'kid123',
      password: '123456'
    }
  const dto2: CreateUserDto = {
      email: 'tbe@gmail.com',
      username: 'tbe123',
      password: '123456'
    }
    const logindata: LoginDto = {
      username: 'kid123',
      password: '123456'
    }
    

    describe('signup', () => {
      it('should signup', () => {
        return pactum.spec().post('/auth').withBody(dto1).stores('useremail','email').expectStatus(201).inspect()

      })

       it('should signup2', () => {
        return pactum.spec().post('/auth').withBody(dto2).stores('username','username').expectStatus(201).inspect()

      })

    })

    describe('login', () => {
      it('should login', () => {
        return pactum.spec().post('/auth/login').withBody(logindata).expectStatus(200).stores('auth','access_token').inspect()
      })
    })


  })

  describe('users', () => {
    describe('get by email', () => {
      it('should get user by email', () => {
        return pactum.spec().get('/users/{email}').withPathParams('email', '$S{useremail}').withHeaders({
          Authorization:'Bearer $S{auth}'
        }).expectStatus(200).inspect()
      })
    })

    describe('get by username', () => {
      it('should get users by user name', () => {
        return pactum.spec().get('/users').withQueryParams('username','kid').withHeaders({
          Authorization:'Bearer $S{auth}'
        }).expectStatus(200).inspect()
      })
    })
  })

  describe('Friend-Requst',()=>{
    describe('request',()=>{
      it('should request frend',()=>{
        return pactum.spec().post('/friend-request/request').withHeaders({
          Authorization:'Bearer  $S{auth}'
        }).withBody({username: "$S{username}"}).stores('reqId','id').expectStatus(201).inspect()
      })
    })

    describe('respond',()=>{
      it('should respond to erquest',()=>{
        return pactum.spec().post('/friend-request/respond/{id}').withBody({accept: true }).withPathParams('id','${reqId}').withHeaders({
          Authorizaton:'Bearer $S{auth2}'
        }).expectStatus(200).inspect()
      })
    })
  })
});
