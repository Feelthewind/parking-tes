import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserRepository } from "../auth/user.repository";
import { Parking } from "./entity/parking.entity";
import { Timezone } from "./entity/timezone.entity";
import { ParkingController } from "./parking.controller";
import { ParkingService } from "./parking.service";

@Module({
  imports: [
    // PassportModule.register({
    //   defaultStrategy: 'jwt',
    //   accessType: 'offline',
    //   prompt: 'consent',
    // }),
    TypeOrmModule.forFeature([UserRepository, Parking, Timezone]),
  ],
  controllers: [ParkingController],
  providers: [ParkingService],
})
export class ParkingModule {}
