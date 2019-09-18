import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as schedule from 'node-schedule';
import { Job } from 'node-schedule';
import { getManager, Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { Parking } from '../parking/entity/parking.entity';
import { CreateOrderDTO } from './dto/create-order.dto';
import { OrderState } from './enum/order-state.enum';
import { Order } from './order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Parking)
    private parkingRepository: Repository<Parking>,
  ) {}

  private job: Job;

  async createOrder(data: CreateOrderDTO, user: User) {
    try {
      const { to } = data;
      let order: Order;
      await getManager().transaction(async manager => {
        order = this.orderRepository.create({
          ...data,
          fk_buyer_id: user.id,
        });
        order = await manager.save(order);
        await manager.update(
          Parking,
          { id: data.fk_parking_id },
          { isAvailable: false },
        );
      });

      // Schedule a job to set the parking as available when times out
      const date = new Date(to);
      this.job = this.scheduleOrder(date, order);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getOrderByUser(user: User) {
    try {
      return this.orderRepository
        .createQueryBuilder('order')
        .innerJoinAndSelect('order.parking', 'parking')
        .innerJoin('order.buyer', 'user')
        .where('user.id = :id', { id: user.id })
        .orderBy('order.createdAt', 'DESC')
        .getOne();
    } catch (error) {
      console.error(error);
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
  }

  async extendOrderTime(orderId: number, timeToExtend: string) {
    const data = timeToExtend.split(':');

    // UPDATE "order" SET "to" = 'order.to' + interval '03 hours 30 minutes' WHERE "id" = $1

    // return getManager().query(
    //   `UPDATE "order" SET "to" = "to" + interval '${data[0]} hours ${
    //     data[1]
    //   } minutes' WHERE id = ${orderId}`,
    // );

    await this.orderRepository
      .createQueryBuilder('order')
      .update()
      .set({
        to: () => `"to" + interval '${data[0]} hours ${data[1]} minutes'`, // "to" 여기서 꼭 double quote 사용!!
      })
      .where('id = :id', { id: orderId })
      .execute();

    const order = await this.orderRepository.findOne({ id: orderId });
    if (this.job.cancel()) {
      const date = new Date(order.to);
      this.scheduleOrder(date, order);
    }
    return order;
  }

  private scheduleOrder(date: Date, order: Order): Job {
    return schedule.scheduleJob(date, async () => {
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
