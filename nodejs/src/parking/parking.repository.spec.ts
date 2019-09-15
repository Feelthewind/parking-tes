import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { User } from '../auth/user.entity';
import { Address } from './address/address.entity';
import { CreateParkingDTO } from './dto/create-parking.dto';
import { ParkingRepository } from './parking.repository';

const mockParkingDTO: CreateParkingDTO = {
  coordinates: 'TestAddress',
  isAvailable: false,
  address: {
    address1: 'df',
    address2: 'df',
    address3: 'df',
    city: 'city',
    postalCode: 'd',
    state: 'd',
  },
};

const mockUser = new User();
const mockAddress = new Address();

describe('ParkingRepository', () => {
  let parkingRepository: ParkingRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ParkingRepository],
    }).compile();

    parkingRepository = await module.get<ParkingRepository>(ParkingRepository);
  });

  describe('createParking', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      parkingRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('Successfully create the user', () => {
      save.mockResolvedValue(undefined);
      expect(
        parkingRepository.createParking(mockParkingDTO, mockUser, mockAddress),
      ).resolves.not.toThrow();
    });

    it('throws a conflict exception as address already exists', () => {
      save.mockRejectedValue({ code: 'ER_DUP_ENTRY' });
      expect(
        parkingRepository.createParking(mockParkingDTO, mockUser, mockAddress),
      ).rejects.toThrow(ConflictException);
    });

    it('throws an internal server exception', () => {
      save.mockRejectedValue({ code: 'j22jk4' });
      expect(
        parkingRepository.createParking(mockParkingDTO, mockUser, mockAddress),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
