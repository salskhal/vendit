import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { clearDatabase, createTestApp } from './helpers/test-app.factory';
import { PASSWORD, seedBuyer, seedSeller } from './helpers/seed.helper';

describe('/deposit (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let buyerToken: string;
  let sellerToken: string;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);

    const buyer = await seedBuyer(dataSource);
    const seller = await seedSeller(dataSource);

    const buyerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: buyer.username, password: PASSWORD });
    buyerToken = buyerLogin.body.access_token;

    const sellerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: seller.username, password: PASSWORD });
    sellerToken = sellerLogin.body.access_token;
  });

  it('accepts a valid coin and returns updated deposit', async () => {
    const res = await request(app.getHttpServer())
      .post('/deposit')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ amount: 50 });

    expect(res.status).toBe(200);
    expect(res.body.deposit).toBe(50);
  });

  it('is cumulative across multiple deposits', async () => {
    await request(app.getHttpServer())
      .post('/deposit')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ amount: 50 });

    const res = await request(app.getHttpServer())
      .post('/deposit')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ amount: 50 });

    expect(res.status).toBe(200);
    expect(res.body.deposit).toBe(100);
  });

  it('rejects an invalid denomination (30)', async () => {
    const res = await request(app.getHttpServer())
      .post('/deposit')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ amount: 30 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/5, 10, 20, 50, 100/);
  });

  it('rejects denomination 0', async () => {
    const res = await request(app.getHttpServer())
      .post('/deposit')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ amount: 0 });

    expect(res.status).toBe(400);
  });

  it('returns 403 when a seller attempts to deposit', async () => {
    const res = await request(app.getHttpServer())
      .post('/deposit')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ amount: 50 });

    expect(res.status).toBe(403);
  });

  it('returns 401 for unauthenticated requests', async () => {
    const res = await request(app.getHttpServer())
      .post('/deposit')
      .send({ amount: 50 });

    expect(res.status).toBe(401);
  });
});
