import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  register(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get('me')
  getMe(@CurrentUser() user: User) {
    return user;
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: User,
  ) {
    if (user.id !== id) throw new ForbiddenException('Cannot update another user');
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    if (user.id !== id) throw new ForbiddenException('Cannot delete another user');
    return this.usersService.remove(id);
  }
}
