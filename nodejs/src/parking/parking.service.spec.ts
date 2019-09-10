import { Test } from '@nestjs/testing';
import { UserRepository } from '../auth/user.repository';
import { OfferRepository } from './offer/offer.repository';
import { ParkingRepository } from './parking.repository';
import { ParkingService } from './parking.service';

const mockRepository = {
  find: jest.fn(),
};

describe('ParkingService', () => {
  let parkingService;
  let parkingRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
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
});
