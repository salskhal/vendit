import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { AllExceptionsFilter } from '../../src/common/filters/http-exception.filter';

export async function createTestApp() {
  // Override DB_NAME with the test database before the module compiles
  process.env.DB_NAME = process.env.DB_NAME_TEST ?? 'vendit_test';

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.init();

  const dataSource = app.get<DataSource>(getDataSourceToken());
  return { app, dataSource };
}

export async function clearDatabase(dataSource: DataSource) {
  await dataSource.query('TRUNCATE TABLE sessions, products, users RESTART IDENTITY CASCADE');
}
