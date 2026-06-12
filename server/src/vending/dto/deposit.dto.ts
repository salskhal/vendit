import { IsIn, IsInt } from 'class-validator';

const VALID_COINS = [5, 10, 20, 50, 100] as const;

export class DepositDto {
  @IsInt()
  @IsIn(VALID_COINS, {
    message: 'Invalid coin denomination. Accepted values: 5, 10, 20, 50, 100',
  })
  amount: number;
}
