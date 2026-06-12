import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productRepo.find();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  create(dto: CreateProductDto, sellerId: string): Promise<Product> {
    const product = this.productRepo.create({ ...dto, sellerId });
    return this.productRepo.save(product);
  }

  async update(id: string, dto: UpdateProductDto, sellerId: string): Promise<Product> {
    const product = await this.findOne(id);
    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('You can only update your own products');
    }
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async remove(id: string, sellerId: string): Promise<void> {
    const product = await this.findOne(id);
    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('You can only delete your own products');
    }
    await this.productRepo.remove(product);
  }
}
