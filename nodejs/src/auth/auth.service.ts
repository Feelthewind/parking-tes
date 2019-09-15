import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
// import * as nodemailer from 'nodemailer';
// import * as stmpTransport from 'nodemailer-smtp-transport';
import { MoreThan } from 'typeorm';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { SignInDTO } from './dto/signin.dto';
import { SignUpDTO } from './dto/signup.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { SocialProvider } from './enum/provider.enum';
import { IJwtPayload } from './interface/jwt-payload.interface';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
// import Mail = require('nodemailer/lib/mailer');

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  signUp(signUpDTO: SignUpDTO): Promise<void> {
    return this.userRepository.signUp(signUpDTO);
  }

  async signIn(signInDTO: SignInDTO): Promise<{ accessToken: string }> {
    const user = await this.userRepository.validateUserPassword(signInDTO);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { email, type } = user;
    const payload: Partial<IJwtPayload> = { email, type };
    const accessToken = await this.jwtService.sign(payload);
    this.logger.debug(
      `Generated JWT Token with payload ${JSON.stringify(payload)}`,
    );

    return { accessToken };
  }

  async refreshToken(payload: Partial<IJwtPayload>) {
    const accessToken = await this.jwtService.sign(payload);
    this.logger.debug(
      `Generated JWT Token with payload ${JSON.stringify(payload)}`,
    );

    return { accessToken };
  }

  async validateOAuthLogin(
    thirdPartyID: string,
    provider: SocialProvider,
  ): Promise<string> {
    try {
      // You can add some registration logic here,
      // to register the user using their thirdPartyId (in this case their googleId)
      // let user: IUser = await this.usersService.findOneByThirdPartyId(thirdPartyId, provider);
      const user = await this.userRepository.findOne({
        provider,
        thirdPartyID,
      });

      if (!user) {
        await this.userRepository.createSocialUser(thirdPartyID, provider);
      }

      const payload = {
        thirdPartyID,
        provider,
      };

      const jwt: string = this.jwtService.sign(payload);
      return jwt;
    } catch (err) {
      throw new InternalServerErrorException('validateOAuthLogin', err.message);
    }
  }

  async updateUser(updateUserDTO: UpdateUserDTO, user: User): Promise<void> {
    await this.userRepository.update({ id: user.id }, updateUserDTO);
  }

  async changePassword(changePasswordDTO: ChangePasswordDTO, user: User) {
    const { currentPassword, newPassword } = changePasswordDTO;
    const valid = await user.validatePassword(currentPassword);
    if (valid) {
      await this.userRepository.changePassword(newPassword, user);
      return 'Password changed!';
    } else {
      return 'Something went wrong!';
    }
  }

  async sendPasswordEmail(host: string, user: User) {
    const token = await crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    // const smtpTransport = this.initializeNodemailer();

    const mailOptions = {
      from: process.env.GOOGLE_EMAIL,
      to: user.email,
      subject: 'Password reset',
      text:
        'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' +
        host +
        '/auth/reset/' +
        token +
        '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n',
    };

    try {
      // await smtpTransport.sendMail(mailOptions);
    } catch (error) {
      console.error(error);
    }
  }

  async checkResetPasswordToken(token: string): Promise<boolean> {
    const found = this.userRepository.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: MoreThan(Date.now()),
    });
    return !!found;
  }

  async resetPassword(password: string, token: string) {
    const user = await this.userRepository.resetPassword(password, token);
    if (user) {
      // const smtpTransport = this.initializeNodemailer();

      const mailOptions = {
        from: process.env.GOOGLE_EMAIL,
        to: user.email,
        subject: 'Your password has been changed',
        text:
          'Hello,\n\n' +
          'This is a confirmation that the password for your account ' +
          user.email +
          ' has just been changed.\n',
      };

      try {
        // await smtpTransport.sendMail(mailOptions);
      } catch (error) {
        console.error(error);
      }
    } else {
      return 'Something went wrong';
    }
  }

  // private initializeNodemailer(): Mail {
  //   return nodemailer.createTransport(
  //     stmpTransport({
  //       service: 'gmail',
  //       host: 'smtp.gmail.com',
  //       auth: {
  //         user: process.env.GOOGLE_EMAIL,
  //         pass: process.env.GOOGLE_PASSWORD,
  //       },
  //     }),
  //   );
  // }
}
