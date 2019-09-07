import {
  Body,
  Controller,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SignInDTO } from './dto/signin.dto';
import { SignUpDTO } from './dto/signUp.dto';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/signup')
  signUp(@Body(ValidationPipe) signUpDTO: SignUpDTO): Promise<void> {
    return this.authService.signUp(signUpDTO);
  }

  @Post('/signin')
  signIn(@Body() signInDTO: SignInDTO): Promise<{ accessToken: string }> {
    return this.authService.signIn(signInDTO);
  }

  @Post('/test')
  @UseGuards(AuthGuard())
  test(@GetUser() user: User) {
    console.dir(user);
  }
}
