import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { BuyDto } from './dto/buy.dto';
import { DepositDto } from './dto/deposit.dto';
import { VendingService } from './vending.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.BUYER)
@Controller()
export class VendingController {
  constructor(private readonly vendingService: VendingService) {}

  @Post('deposit')
  @HttpCode(HttpStatus.OK)
  deposit(@CurrentUser() user: User, @Body() dto: DepositDto) {
    return this.vendingService.deposit(user.id, dto);
  }

  @Post('buy')
  @HttpCode(HttpStatus.OK)
  buy(@CurrentUser() user: User, @Body() dto: BuyDto) {
    return this.vendingService.buy(user.id, dto);
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  reset(@CurrentUser() user: User) {
    return this.vendingService.reset(user.id);
  }
}
