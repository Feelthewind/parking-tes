import { Module } from "@nestjs/common";
import { AuthModule } from "../../src/auth/auth.module";
import { OrderModule } from "../../src/order/order.module";
import { ParkingModule } from "../../src/parking/parking.module";
import { FixturesService } from "./fixtures.service";

@Module({
  imports: [AuthModule, ParkingModule, OrderModule],
  providers: [FixturesService],
})
export class FixturesModule {}
