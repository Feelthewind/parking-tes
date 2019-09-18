import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

  async createOrder(data: CreateOrderDTO, user: User) {
    try {
      await getManager().transaction(async manager => {
        const order = this.orderRepository.create({
          ...data,
          fk_buyer_id: user.id,
        });
        await manager.save(order);
        await manager.update(
          Parking,
          { id: data.fk_parking_id },
          { isAvailable: false },
        );
      });

      // TODO: schedule a job to set the parking as disabled when times out
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

    return this.orderRepository
      .createQueryBuilder('order')
      .update()
      .set({
        to: () => `"to" + interval '${data[0]} hours ${data[1]} minutes'`, // "to" 여기서 꼭 double quote 사용!!
      })
      .where('id = :id', { id: orderId })
      .execute();
  }
}
