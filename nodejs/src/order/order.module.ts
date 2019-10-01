import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../auth/user.entity";
import { Parking } from "../parking/entity/parking.entity";
import { OrderController } from "./order.controller";
import { Order } from "./order.entity";
import { OrderService } from "./order.service";

@Module({
  imports: [TypeOrmModule.forFeature([Order, Parking, User])],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
