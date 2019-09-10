import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { typeOrmConfig } from './config/typeorm.config';
import { ParkingModule } from './parking/parking.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), AuthModule, ParkingModule],
})
export class AppModule {}
