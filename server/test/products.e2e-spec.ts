import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { clearDatabase, createTestApp } from './helpers/test-app.factory';
import { PASSWORD, seedBuyer, seedSeller } from './helpers/seed.helper';

describe('POST /products (e2e)', () => {
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

  const validProduct = { productName: 'Cola', cost: 35, amountAvailable: 10 };

  it('allows a seller to create a product', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send(validProduct);

    expect(res.status).toBe(201);
    expect(res.body.productName).toBe('Cola');
    expect(res.body.cost).toBe(35);
    expect(res.body.sellerId).toBeDefined();
  });

  it('returns 400 when cost is not a multiple of 5', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ ...validProduct, cost: 33 });

    expect(res.status).toBe(400);
    const messages: string[] = Array.isArray(res.body.message) ? res.body.message : [res.body.message];
    expect(messages.some((m) => /multiple of 5/i.test(m))).toBe(true);
  });

  it('returns 400 when productName is missing', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ cost: 35, amountAvailable: 10 });

    expect(res.status).toBe(400);
  });

  it('returns 400 when amountAvailable is negative', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ ...validProduct, amountAvailable: -1 });

    expect(res.status).toBe(400);
  });

  it('returns 403 when a buyer attempts to create a product', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send(validProduct);

    expect(res.status).toBe(403);
  });

  it('returns 401 for unauthenticated requests', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .send(validProduct);

    expect(res.status).toBe(401);
  });
});
