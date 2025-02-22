import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import request from 'supertest';

describe('Fetch Recent Questions E2E', () => {
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

      await prisma.question.createMany({
        data: [
          {
            title: 'How to create a new user?',
            content:
              'I need to create a new user in my application, how can I do that?',
            slug: 'how-to-create-a-new-user',
            authorId: user.id,
          },
          {
            title: 'How to delete a user?',
            content:
              'I need to delete a user in my application, how can I do that?',
            slug: 'how-to-delete-a-user',
            authorId: user.id,
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/questions')
        .auth(token, { type: 'bearer' })
        .expect(200);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('questions');
    });
  });
});
