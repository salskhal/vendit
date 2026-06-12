import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { VendingController } from './vending.controller';
import { VendingService } from './vending.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Product]), UsersModule],
  controllers: [VendingController],
  providers: [VendingService],
})
export class VendingModule {}
