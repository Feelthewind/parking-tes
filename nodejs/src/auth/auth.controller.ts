import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignInDTO } from './dto/signin.dto';
import { SignUpDTO } from './dto/signUp.dto';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');
  private expiresIn = 3600;

  constructor(private authService: AuthService) {}
  @Post('/signup')
  signUp(@Body(ValidationPipe) signUpDTO: SignUpDTO): Promise<void> {
    return this.authService.signUp(signUpDTO);
  }

  @Post('/signin')
  signIn(@Body() signInDTO: SignInDTO): Promise<{ accessToken: string }> {
    return this.authService.signIn(signInDTO);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // initiates the Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req, @Res() res: Response) {
    // handles the Google OAuth2 callback
    const jwt: string = req.user.jwt;
    if (jwt) {
      res.redirect(
        `http://localhost:4200/login/succes?jwt=${jwt}&expiresIn=${
          this.expiresIn
        }`,
      );
    } else {
      res.redirect('http://localhost:4200/login/failure');
    }
  }

  @Get('refresh-token')
  @UseGuards(AuthGuard())
  async refreshToken(@Req() req, @Res() res: Response) {
    const { email, provider, thirdPartyID } = req.user as User;
    let payload;
    if (email) {
      payload = { email };
    } else {
      payload = { provider, thirdPartyID };
    }
    const jwt = await this.authService.refreshToken(payload);
    if (jwt) {
      res.json({ jwt, expiresIn: this.expiresIn });
    }
  }

  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  naverLogin() {
    //
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  naverLoginCallback(@Req() req, @Res() res) {
    const jwt: string = req.user.jwt;

    if (jwt) {
      res.redirect(
        `http://localhost:4200/login/succes?jwt=${jwt}&expiresIn=${
          this.expiresIn
        }`,
      );
    } else {
      res.redirect('http://localhost:4200/login/failure');
    }
  }

  @Get('/test')
  @UseGuards(AuthGuard())
  test(@GetUser() user: User) {
    this.logger.log(`USER of this request is ${JSON.stringify(user)}`);
  }
}
