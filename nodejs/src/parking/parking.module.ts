import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../auth/user.repository';
import { OfferRepository } from './offer.repository';
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
    TypeOrmModule.forFeature([
      UserRepository,
      ParkingRepository,
      OfferRepository,
    ]),
  ],
  controllers: [ParkingController],
  providers: [ParkingService],
})
export class ParkingModule {}
