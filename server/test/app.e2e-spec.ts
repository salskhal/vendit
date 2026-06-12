import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { clearDatabase, createTestApp } from './helpers/test-app.factory';

describe('App (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
  });

  it('GET /products returns 200 with an array (public endpoint)', () => {
    return request(app.getHttpServer())
      .get('/products')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('POST /auth/login returns 401 for unknown credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'nobody', password: 'wrong' })
      .expect(401);
  });

  it('GET /user/me returns 401 without a token', () => {
    return request(app.getHttpServer())
      .get('/user/me')
      .expect(401);
  });
});
