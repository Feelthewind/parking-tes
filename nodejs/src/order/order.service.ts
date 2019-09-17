import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { Parking } from '../parking/entity/parking.entity';
import { CreateOrderDTO } from './dto/create-order.dto';
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

  async cancelOrder() {
    //
  }

  async expandOrderTime() {
    //
  }
}
