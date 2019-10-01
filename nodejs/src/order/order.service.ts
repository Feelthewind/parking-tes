import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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
import { OrderRO } from "./ro/order.ro";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Parking)
    private parkingRepository: Repository<Parking>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createOrder(data: CreateOrderDTO, user: User): Promise<OrderRO> {
    // TODO: check if timezone is correct from dto

    // Check if the one who make this call is the same as the one who made the parking => error
    const { parkingId } = data;
    const parking = await this.parkingRepository.findOne({
      id: parkingId,
    });
    if (user.inUse) {
      throw new ConflictException("주차장을 현재 사용중입니다.");
    }
    if (parking.userId === user.id) {
      throw new BadRequestException(
        "자신이 공유한 주차장은 구매할 수 없습니다.",
      );
    }

    try {
      const { minutes } = data;
      const to = moment()
        .add(minutes, "minutes")
        .toDate();
      let order: Order;
      await getManager().transaction(async manager => {
        order = this.orderRepository.create({
          ...data,
          from: new Date(),
          to,
          fk_parking_id: data.parkingId,
          fk_buyer_id: user.id,
        });
        order = await manager.save(order);
        await manager.update(
          Parking,
          { id: data.parkingId },
          { isAvailable: false },
        );
        await manager.update(User, { id: user.id }, { inUse: true });
      });

      // Schedule a job to set the parking as available when times out
      console.log(to);
      this.scheduleOrder(to, order);

      // TODO: Save job to reschedule when server restarts.

      return order.toResponseObject();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getOrderByUser(user: User): Promise<OrderRO | NotFoundException> {
    try {
      const order = await this.orderRepository
        .createQueryBuilder("order")
        .leftJoinAndSelect("order.parking", "parking")
        .leftJoinAndSelect("parking.images", "images")
        .leftJoinAndSelect("parking.timezones", "timezones")
        .innerJoin("order.buyer", "user")
        .where("user.id = :id", { id: user.id })
        .andWhere("order.state = :state", { state: OrderState.IN_USE })
        .orderBy("order.createdAt", "DESC")
        .getOne();
      console.log("========order=========");
      console.dir(order);

      if (!order) {
        return new NotFoundException("주문을 찾을 수가 없습니다.");
      }

      return order.toResponseObject();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async cancelOrder(orderId: number, user: User): Promise<void> {
    try {
      const order = await this.orderRepository.findOne({ id: orderId }); // To get parkingId
      await this.orderRepository.update(
        { id: orderId },
        { state: OrderState.CANCELLED },
      );
      await this.parkingRepository.update(
        { id: order.fk_parking_id },
        { isAvailable: true },
      );
      await this.userRepository.update({ id: user.id }, { inUse: false });
      const job = schedule.scheduledJobs[orderId];
      if (job) {
        job.cancel();
      }
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async extendOrderTime(
    orderId: number,
    timeToExtend: string,
  ): Promise<OrderRO> {
    try {
      await this.orderRepository
        .createQueryBuilder("order")
        .update()
        .set({
          to: () => `"to" + interval '${timeToExtend} minutes'`, // "to" 여기서 꼭 double quote 사용!!
        })
        .where("id = :id", { id: orderId })
        .execute();

      // await this.orderRepository
      //   .createQueryBuilder("order")
      //   .update()
      //   .set({
      //     to: () => `"to" + interval '${data[0]} hours ${data[1]} minutes'`, // "to" 여기서 꼭 double quote 사용!!
      //   })
      //   .where("id = :id", { id: orderId })
      //   .execute();

      const order = await this.orderRepository.findOne(
        { id: orderId },
        { relations: ["parking", "parking.timezones", "parking.images"] }, // for frontend.. flutter json structure is now bad
      );
      const job = schedule.scheduledJobs[orderId];
      if (job && job.cancel()) {
        console.log("cancelled an order and reschedule!");
        const date = new Date(order.to);
        this.scheduleOrder(date, order);
      }
      return order.toResponseObject();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async checkOrder(): Promise<void> {
    try {
      const orders = await this.orderRepository.find({
        where: { state: OrderState.IN_USE },
        relations: ["buyer"],
      });
      for (const order of orders) {
        const date = new Date(order.to);
        this.scheduleOrder(date, order);
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  private scheduleOrder(date: Date, order: Order): void {
    schedule.scheduleJob(order.id.toString(), date, async () => {
      await this.orderRepository.update(
        { id: order.id },
        { state: OrderState.FINISHED },
      );
      await this.parkingRepository.update(
        { id: order.fk_parking_id },
        { isAvailable: true },
      );
      await this.userRepository.update(
        { id: order.fk_buyer_id },
        { inUse: false },
      );
    });
  }
}
