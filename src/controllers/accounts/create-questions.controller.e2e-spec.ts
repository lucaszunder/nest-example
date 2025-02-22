import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import request from 'supertest';

describe('Create Question E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  describe('[POST] /questions', async () => {
    test('expect 201 when all the parameters is provided', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'johndoe@gmail.com',
          name: 'John Doe',
          password: await hash('123456', 8),
        },
      });

      const token = jwt.sign({ sub: user.id });

      const response = await request(app.getHttpServer())
        .post('/questions')
        .send({
          title: 'How to create a new user?',
          content:
            'I need to create a new user in my application, how can I do that?',
        })
        .auth(token, { type: 'bearer' })
        .expect(200);

      expect(response.status).toBe(200);

      expect(response.body).toHaveProperty('title');
    });
  });
});
