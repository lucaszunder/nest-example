import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('Create User E2E', () => {
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

  describe('[POST] /users', async () => {
    test('expect 201 when all the parameters is provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/accounts')
        .send({
          email: 'johndoe@gmail.com',
          name: 'John Doe',
          password: '123456',
        });

      expect(response.status).toBe(201);

      const userOnDatabase = await prisma.user.findUnique({
        where: {
          email: 'johndoe@gmail.com',
        },
      });
      expect(userOnDatabase).not.toBeNull();
    });
  });
});
