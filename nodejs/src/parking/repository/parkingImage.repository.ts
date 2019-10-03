import { Logger } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm";
import { ParkingImage } from "../entity/parkingImage.entity";

@EntityRepository(ParkingImage)
export class ParkingImageRepository extends Repository<ParkingImage> {
  private logger = new Logger("ParkingImageRepository");
}
