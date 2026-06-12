import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { Role } from '../../src/common/enums/role.enum';
import { Product } from '../../src/products/entities/product.entity';
import { User } from '../../src/users/entities/user.entity';

const PASSWORD = 'password123';
const PASSWORD_HASH = bcrypt.hashSync(PASSWORD, 10);

export async function seedBuyer(dataSource: DataSource): Promise<User> {
  const repo = dataSource.getRepository(User);
  const user = repo.create({
    username: 'testbuyer',
    password: PASSWORD_HASH,
    role: Role.BUYER,
    deposit: 0,
  });
  return repo.save(user);
}

export async function seedSeller(dataSource: DataSource): Promise<User> {
  const repo = dataSource.getRepository(User);
  const user = repo.create({
    username: 'testseller',
    password: PASSWORD_HASH,
    role: Role.SELLER,
    deposit: 0,
  });
  return repo.save(user);
}

export async function seedProduct(
  dataSource: DataSource,
  sellerId: string,
  overrides: Partial<Pick<Product, 'productName' | 'cost' | 'amountAvailable'>> = {},
): Promise<Product> {
  const repo = dataSource.getRepository(Product);
  const product = repo.create({
    productName: 'Test Cola',
    cost: 30,
    amountAvailable: 10,
    sellerId,
    ...overrides,
  });
  return repo.save(product);
}

export { PASSWORD };
