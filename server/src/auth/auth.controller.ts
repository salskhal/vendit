import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

type AuthenticatedUser = User & { currentJti: string };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Request() req: any, @Body() _dto: LoginDto) {
    return this.authService.login(req.user as User);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.logout(user.currentJti);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout/all')
  logoutAll(@CurrentUser() user: User) {
    return this.authService.logoutAll(user.id);
  }
}
