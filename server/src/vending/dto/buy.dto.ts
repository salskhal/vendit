import { IsInt, IsUUID, Min } from 'class-validator';

export class BuyDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1, { message: 'Amount must be at least 1' })
  amount: number;
}
