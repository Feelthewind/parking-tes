import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../auth/user.repository';
import { ParkingController } from './parking.controller';
import { ParkingRepository } from './parking.repository';
import { ParkingService } from './parking.service';

@Module({
  imports: [
    // PassportModule.register({
    //   defaultStrategy: 'jwt',
    //   accessType: 'offline',
    //   prompt: 'consent',
    // }),
    TypeOrmModule.forFeature([UserRepository, ParkingRepository]),
  ],
  controllers: [ParkingController],
  providers: [ParkingService],
})
export class ParkingModule {}
