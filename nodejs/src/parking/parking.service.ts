import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Brackets, getConnection, Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { UserRepository } from '../auth/user.repository';
import { CreateParkingDTO } from './dto/create-parking.dto';
import { Address } from './entity/address.entity';
import { Parking } from './entity/parking.entity';
import { Timezone } from './entity/timezone.entity';
import { OfferRepository } from './offer/offer.repository';

@Injectable()
export class ParkingService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(OfferRepository)
    private offerRepository: OfferRepository,
    @InjectRepository(Parking)
    private parkingRepository: Repository<Parking>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(Timezone)
    private timezoneRepository: Repository<Timezone>,
  ) {}

  async setAvailable(isAvailable: boolean, user: User) {
    await this.parkingRepository.update({ userId: user.id }, { isAvailable });
  }

  async createParking(
    createParkingDTO: CreateParkingDTO,
    user: User,
  ): Promise<Parking> {
    const { coordinates, timezones } = createParkingDTO;

    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const { address } = createParkingDTO;
      let newAddress = this.addressRepository.create(address);
      newAddress = await queryRunner.manager.save(newAddress);

      let parking = this.parkingRepository.create();
      parking.addressId = newAddress.id;
      parking.coordinates = coordinates;
      parking.isAvailable = false;
      parking.userId = user.id;
      parking = await queryRunner.manager.save(parking);

      const timezonesToSave: Timezone[] = [];
      for (const t of timezones) {
        const timezone = this.timezoneRepository.create();
        timezone.parkingId = parking.id;
        timezone.day = t.day;
        timezone.from = t.from;
        timezone.to = t.to;
        timezonesToSave.push(timezone);
      }
      await queryRunner.manager.save(timezonesToSave);

      await queryRunner.commitTransaction();
      return parking;
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }

    // return this.parkingRepository.createParking(
    //   createParkingDTO,
    //   user,
    //   newAddress,
    // );
  }

  async createOffer(parkingId: number, user: User): Promise<void> {
    const parking = await this.parkingRepository.findOne({ id: parkingId });
    if (!parking.isAvailable) {
      throw new NotAcceptableException();
    }
    const offer = this.offerRepository.create();
    offer.buyerId = user.id;
    offer.parkingId = parkingId;
    try {
      await offer.save();
    } catch (error) {
      console.error(error);
    }
  }

  async acceptOffer(buyerId: number, owner: User): Promise<void> {
    const {
      parking: { id: parkingId },
    } = await this.userRepository.findOne(
      { id: owner.id },
      { relations: ['parking'] },
    );
    try {
      await this.offerRepository.update(
        { parkingId, buyerId },
        { chosen: true },
      );
    } catch (error) {
      console.error(error);
    }
  }

  async getTimeToExtend(parkingId: number) {
    const date = new Date();
    const day = date.getDay();
    const nextDay = day + 1;
    const hours = date.getHours();
    const hoursLeft = 24 - hours;
    const minutes = date.getMinutes();
    const minutesLeft = 60 - minutes;
    const startTime = `${hours}:${minutes}`;

    const parking = await this.parkingRepository
      .createQueryBuilder('parking')
      .leftJoinAndSelect('parking.timezones', 'timezones')
      .where('parking.id = :id', { id: parkingId })
      .andWhere(
        new Brackets(qb => {
          qb.where(`timezones.day = ${day}`).andWhere(
            `timezones.from <= :from`,
            { from: startTime },
          );
        }),
      )
      .orWhere(
        new Brackets(qb => {
          qb.where(`timezones.day = ${nextDay}`).andWhere(
            `timezones.from = '00:00'`,
          );
        }),
      )
      .getOne();

    const maxTime = parking.timezones
      .sort((a, b) => {
        return b.day - a.day;
      })[0]
      .to.split(':');

    const current = moment([hours, minutes], 'HH:mm');
    const max = moment([maxTime[0], maxTime[1]], 'HH:mm');
    let result = max.diff(current, 'minutes');
    if (parking.timezones.length === 2) {
      result = result + hoursLeft * 60 + minutesLeft;
    }
    return result;
  }

  async getParkings(usageTime: number): Promise<Parking[]> {
    // 기본 사용시간은 최소 1시간, 최대 8시간
    if (usageTime && (usageTime < 60 || usageTime > 480)) {
      throw new UnprocessableEntityException();
    }

    const end = moment().add(usageTime, 'minutes');
    const endDay = end.day();
    const endHours = end.hours();
    const endMinutes = end.minutes();
    const endTime = `${endHours}:${endMinutes}`;

    const date = new Date();
    const day = date.getDay();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const startTime = `${hours}:${minutes}`;

    const query = this.parkingRepository
      .createQueryBuilder('parking')
      .leftJoinAndSelect('parking.timezones', 'timezones');

    if (day === endDay) {
      return query
        .andWhere('timezones.day = :day', { day })
        .andWhere(`timezones.from <= :from`, { from: startTime })
        .andWhere(`timezones.to >= :to`, { to: startTime })
        .andWhere(`timezones.from <= :from`, { from: endTime })
        .andWhere(`timezones.to >= :to`, { to: endTime })
        .getMany();
    }

    if (endDay === day + 1) {
      return query
        .andWhere(
          new Brackets(qb => {
            qb.where(`timezones.day = ${day}`)
              .andWhere(`timezones.from <= '${startTime}'`)
              .andWhere(`timezones.to = '24:00'`);
          }),
        )
        .orWhere(
          new Brackets(qb => {
            qb.where(`timezones.day = ${endDay}`)
              .andWhere(`timezones.from = '00:00'`)
              .andWhere(`timezones.to >= '${endTime}'`);
          }),
        )
        .getMany();
    }
  }
}
