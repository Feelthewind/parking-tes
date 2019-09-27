import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as moment from "moment";
import * as schedule from "node-schedule";
import { getManager, Repository } from "typeorm";
import { User } from "../auth/user.entity";
import { Parking } from "../parking/entity/parking.entity";
import { CreateOrderDTO } from "./dto/create-order.dto";
import { OrderState } from "./enum/order-state.enum";
import { Order } from "./order.entity";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Parking)
    private parkingRepository: Repository<Parking>,
  ) {}

  async createOrder(data: CreateOrderDTO, user: User) {
    // TODO: check if timezone is correct from dto

    // Check if the one who make this call is the same as the one who made the parking => error
    const { parkingId } = data;
    const parking = await this.parkingRepository.findOne({
      id: parkingId,
    });
    if (parking.userId === user.id) {
      throw new BadRequestException(
        "자신이 공유한 주차장은 구매할 수 없습니다.",
      );
    }

    try {
      const { to, minutes } = data;
      let order: Order;
      await getManager().transaction(async manager => {
        order = this.orderRepository.create({
          ...data,
          from: new Date(),
          to: moment()
            .add(minutes, "minutes")
            .toDate(),
          fk_parking_id: data.parkingId,
          fk_buyer_id: user.id,
        });
        order = await manager.save(order);
        await manager.update(
          Parking,
          { id: data.parkingId },
          { isAvailable: false },
        );
      });

      // Schedule a job to set the parking as available when times out
      const date = new Date(to);
      console.log(to);
      this.scheduleOrder(date, order);

      // TODO: Save job to reschedule when server restarts.
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getOrderByUser(user: User) {
    try {
      const order = await this.orderRepository
        .createQueryBuilder("order")
        .innerJoinAndSelect("order.parking", "parking")
        .innerJoinAndSelect("parking.images", "images")
        .innerJoin("order.buyer", "user")
        .where("user.id = :id", { id: user.id })
        .orderBy("order.createdAt", "DESC")
        .getOne();
      return order.toResponseObject();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async cancelOrder(orderId: number) {
    const order = await this.orderRepository.findOne({ id: orderId }); // To get parkingId
    await this.orderRepository.update(
      { id: orderId },
      { state: OrderState.CANCELLED },
    );
    await this.parkingRepository.update(
      { id: order.fk_parking_id },
      { isAvailable: false },
    );
    const job = schedule.scheduledJobs[orderId];
    if (job) {
      job.cancel();
    }
  }

  async extendOrderTime(orderId: number, timeToExtend: string) {
    const data = timeToExtend.split(":");

    // UPDATE "order" SET "to" = 'order.to' + interval '03 hours 30 minutes' WHERE "id" = $1

    // return getManager().query(
    //   `UPDATE "order" SET "to" = "to" + interval '${data[0]} hours ${
    //     data[1]
    //   } minutes' WHERE id = ${orderId}`,
    // );

    await this.orderRepository
      .createQueryBuilder("order")
      .update()
      .set({
        to: () => `"to" + interval '${data[0]} hours ${data[1]} minutes'`, // "to" 여기서 꼭 double quote 사용!!
      })
      .where("id = :id", { id: orderId })
      .execute();

    const order = await this.orderRepository.findOne({ id: orderId });
    const job = schedule.scheduledJobs[orderId];
    if (job && job.cancel()) {
      console.log("cancelled an order and reschedule!");
      const date = new Date(order.to);
      this.scheduleOrder(date, order);
    }
    return order;
  }

  async checkOrder() {
    try {
      const orders = await this.orderRepository.find({
        state: OrderState.IN_USE,
      });
      for (const order of orders) {
        const date = new Date(order.to);
        this.scheduleOrder(date, order);
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  private scheduleOrder(date: Date, order: Order) {
    return schedule.scheduleJob(order.id.toString(), date, async () => {
      await this.orderRepository.update(
        { id: order.id },
        { state: OrderState.FINISHED },
      );
      await this.parkingRepository.update(
        { id: order.fk_parking_id },
        { isAvailable: true },
      );
    });
  }
}
