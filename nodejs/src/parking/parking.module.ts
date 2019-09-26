import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { TypeOrmModule } from "@nestjs/typeorm";
import { diskStorage } from "multer";
import * as path from "path";
import { UserRepository } from "../auth/user.repository";
import { Parking } from "./entity/parking.entity";
import { ParkingImage } from "./entity/parkingImage.entity";
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
    TypeOrmModule.forFeature([UserRepository, Parking, Timezone, ParkingImage]),
    MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 },
      storage: diskStorage({
        destination: (req, file, cb) => {
          return cb(null, "public/img");
        },
        filename: (req, file, cb) => {
          console.log("multer called");
          const ext = path.extname(file.originalname);
          return cb(
            null,
            path.basename(file.originalname, ext) + new Date().valueOf() + ext,
          );
        },
      }),
    }),
  ],
  controllers: [ParkingController],
  providers: [ParkingService],
})
export class ParkingModule {}
