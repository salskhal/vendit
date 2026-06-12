import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { BuyDto } from './dto/buy.dto';
import { DepositDto } from './dto/deposit.dto';
import { calculateChange } from './helpers/change-calculator';

@Injectable()
export class VendingService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  async deposit(userId: string, dto: DepositDto) {
    const user = await this.usersService.findById(userId);
    const newDeposit = user.deposit + dto.amount;
    await this.usersService.updateDeposit(userId, newDeposit);
    return { deposit: newDeposit };
  }

  async buy(userId: string, dto: BuyDto) {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager
        .getRepository(User)
        .findOne({ where: { id: userId } });

      const product = await manager
        .getRepository(Product)
        .createQueryBuilder('product')
        .setLock('pessimistic_write')
        .where('product.id = :id', { id: dto.productId })
        .getOne();

      if (!product) throw new NotFoundException('Product not found');

      if (product.amountAvailable < dto.amount) {
        throw new BadRequestException(
          `Insufficient stock. Requested: ${dto.amount}, available: ${product.amountAvailable}`,
        );
      }

      const totalCost = product.cost * dto.amount;
      if (user!.deposit < totalCost) {
        throw new BadRequestException(
          `Insufficient funds. Required: ${totalCost} cents, available: ${user!.deposit} cents`,
        );
      }

      const change = calculateChange(user!.deposit - totalCost);

      await manager.getRepository(Product).update(product.id, {
        amountAvailable: product.amountAvailable - dto.amount,
      });
      await manager.getRepository(User).update(userId, { deposit: 0 });

      return {
        totalSpent: totalCost,
        products: {
          productName: product.productName,
          amount: dto.amount,
          costPerUnit: product.cost,
        },
        change,
      };
    });
  }

  async reset(userId: string) {
    await this.usersService.updateDeposit(userId, 0);
    return { deposit: 0 };
  }
}
