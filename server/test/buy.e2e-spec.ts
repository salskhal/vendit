import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { clearDatabase, createTestApp } from './helpers/test-app.factory';
import { PASSWORD, seedBuyer, seedProduct, seedSeller } from './helpers/seed.helper';

describe('/buy (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let buyerToken: string;
  let sellerToken: string;
  let productId: string;

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
    const product = await seedProduct(dataSource, seller.id, {
      productName: 'Cola',
      cost: 30,
      amountAvailable: 5,
    });
    productId = product.id;

    const buyerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: buyer.username, password: PASSWORD });
    buyerToken = buyerLogin.body.access_token;

    const sellerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: seller.username, password: PASSWORD });
    sellerToken = sellerLogin.body.access_token;

    // Give the buyer enough deposit to make purchases
    await request(app.getHttpServer())
      .post('/deposit')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ amount: 100 });
  });

  it('returns totalSpent, products, and change on a successful purchase', async () => {
    const res = await request(app.getHttpServer())
      .post('/buy')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ productId, amount: 2 });

    expect(res.status).toBe(200);
    expect(res.body.totalSpent).toBe(60);
    expect(res.body.products.productName).toBe('Cola');
    expect(res.body.products.amount).toBe(2);
    expect(Array.isArray(res.body.change)).toBe(true);
    // change should sum to 100 - 60 = 40
    const changeSum = (res.body.change as number[]).reduce((a, b) => a + b, 0);
    expect(changeSum).toBe(40);
  });

  it('resets buyer deposit to 0 after a successful purchase', async () => {
    await request(app.getHttpServer())
      .post('/buy')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ productId, amount: 1 });

    const meRes = await request(app.getHttpServer())
      .get('/user/me')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(meRes.body.deposit).toBe(0);
  });

  it('decrements amountAvailable after a successful purchase', async () => {
    await request(app.getHttpServer())
      .post('/buy')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ productId, amount: 2 });

    const productRes = await request(app.getHttpServer())
      .get(`/products/${productId}`);

    expect(productRes.body.amountAvailable).toBe(3);
  });

  it('returns 400 when buyer has insufficient funds', async () => {
    // Reset deposit to 0 first
    await request(app.getHttpServer())
      .post('/reset')
      .set('Authorization', `Bearer ${buyerToken}`);

    const res = await request(app.getHttpServer())
      .post('/buy')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ productId, amount: 1 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/insufficient funds/i);
  });

  it('returns 400 when requested amount exceeds available stock', async () => {
    const res = await request(app.getHttpServer())
      .post('/buy')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ productId, amount: 99 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/insufficient stock/i);
  });

  it('returns 404 when product does not exist', async () => {
    const res = await request(app.getHttpServer())
      .post('/buy')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ productId: '00000000-0000-0000-0000-000000000000', amount: 1 });

    expect(res.status).toBe(404);
  });

  it('returns 400 when amount is 0', async () => {
    const res = await request(app.getHttpServer())
      .post('/buy')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ productId, amount: 0 });

    expect(res.status).toBe(400);
  });

  it('returns 403 when a seller attempts to buy', async () => {
    const res = await request(app.getHttpServer())
      .post('/buy')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ productId, amount: 1 });

    expect(res.status).toBe(403);
  });

  it('returns 401 for unauthenticated requests', async () => {
    const res = await request(app.getHttpServer())
      .post('/buy')
      .send({ productId, amount: 1 });

    expect(res.status).toBe(401);
  });
});
