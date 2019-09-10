import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as config from 'config';
import { diskStorage } from 'multer';
import * as path from 'path';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategy/google.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { NaverStrategy } from './strategy/naver.strategy';
import { UserRepository } from './user.repository';

const jwtConfig = config.get('jwt');

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
      accessType: 'offline',
      prompt: 'consent',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.expiresIn,
      },
    }),
    TypeOrmModule.forFeature([UserRepository]),
    MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 },
      storage: diskStorage({
        destination: (req, file, cb) => {
          return cb(null, 'public/img');
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          return cb(
            null,
            path.basename(file.originalname, ext) + new Date().valueOf() + ext,
          );
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, NaverStrategy],
  exports: [PassportModule, JwtStrategy],
})
export class AuthModule {}
