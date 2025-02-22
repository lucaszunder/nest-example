import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import request from 'supertest';

describe('Authenticate user E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

    await app.init();
  });

  describe('[POST] /sessions', async () => {
    test('expect 201 when all the parameters is provided', async () => {
      await prisma.user.create({
        data: {
          email: 'johndoe@gmail.com',
          name: 'John Doe',
          password: await hash('123456', 8),
        },
      });

      const response = await request(app.getHttpServer())
        .post('/sessions')
        .send({
          email: 'johndoe@gmail.com',
          password: '123456',
        })
        .expect(200);

      expect(response.status).toBe(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toEqual({
        access_token: expect.any(String),
      });
    });
  });
});
