import { IsInt, IsNotEmpty, IsPositive, IsString, Min, Validate, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isDivisibleBy5' })
class IsDivisibleBy5 implements ValidatorConstraintInterface {
  validate(value: number) {
    return value % 5 === 0;
  }
  defaultMessage() {
    return 'Product cost must be a multiple of 5 cents';
  }
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsInt()
  @Min(0)
  amountAvailable: number;

  @IsInt()
  @IsPositive()
  @Validate(IsDivisibleBy5)
  cost: number;
}
