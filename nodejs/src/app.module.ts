import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { typeOrmConfig } from './config/typeorm.config';
import { ParkingModule } from './parking/parking.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), AuthModule, ParkingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
