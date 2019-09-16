import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/user.entity';
import { UserRepository } from '../auth/user.repository';
import { Address } from './address.entity';
import { OfferRepository } from './offer/offer.repository';
import { ParkingRepository } from './parking.repository';
import { ParkingService } from './parking.service';

const mockRepository = {
  find: jest.fn(),
  setLocation: jest.fn(),
};

describe('ParkingService', () => {
  let parkingService: ParkingService;
  let parkingRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([Address])],
      providers: [
        ParkingService,
        UserRepository,
        OfferRepository,
        {
          provide: ParkingRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    parkingService = module.get<ParkingService>(ParkingService);
    parkingRepository = module.get<ParkingRepository>(ParkingRepository);
  });

  describe('getParkings', () => {
    it('gets all parkings from the repository', async () => {
      parkingRepository.find.mockResolvedValue('someValue');

      const result = await parkingService.getParkings();
      expect(parkingRepository.find).toHaveBeenCalled();
      expect(result).toEqual('someValue');
    });
  });

  describe('setLocation', () => {
    it('set location of the parking', async () => {
      const user = new User();
      await parkingService.setLocation(1, 1, user);
      expect(parkingRepository.setLocation).toHaveBeenCalledWith(1, 1, user);
    });
  });
});
