import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { UserRepository } from '../auth/user.repository';
import { Address } from './address.entity';
import { CreateParkingDTO } from './dto/create-parking.dto';
import { OfferRepository } from './offer/offer.repository';
import { Parking } from './parking.entity';
import { ParkingRepository } from './parking.repository';
import { Timezone } from './timezone.entity';

@Injectable()
export class ParkingService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(ParkingRepository)
    private parkingRepository: ParkingRepository,
    @InjectRepository(OfferRepository)
    private offerRepository: OfferRepository,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(Timezone)
    private timezoneRepository: Repository<Timezone>,
  ) {}

  // change address to lat, lng later for spatial column
  async setLocation(lat: number, lng: number, user: User): Promise<void> {
    await this.parkingRepository.setLocation(lat, lng, user);
  }

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
      for (let i = 0; i < timezones.length; i++) {
        const timezone = this.timezoneRepository.create();
        timezone.parkingId = parking.id;
        timezone.day = timezones[i].day;
        timezone.from = timezones[i].from;
        timezone.to = timezones[i].to;
        timezonesToSave.push(timezone);
      }
      await queryRunner.manager.save(timezonesToSave);

      await queryRunner.commitTransaction();
      return parking;
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
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

  async getParkings(): Promise<Parking[]> {
    const date = new Date();
    const day = date.getDay();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    let dayString;

    switch (day) {
      case 0:
        dayString = 'monday';
        break;
      case 1:
        dayString = 'thuesday';
        break;
      case 2:
        dayString = 'wednesday';
        break;
      case 3:
        dayString = 'thursday';
        break;
      case 4:
        dayString = 'friday';
        break;
      case 5:
        dayString = 'saturday';
        break;
      case 6:
        dayString = 'sunday';
        break;
      default:
        console.log('days setting!');
    }

    return this.parkingRepository.find({
      relations: ['address', 'user'],
    });

    // return this.parkingRepository.find({
    //   relations: ['address', 'user'],
    //   where: {
    //     days: {
    //       [dayString]: {
    //         from:
    //       },
    //     },
    //   },
    // });
  }
}
