import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { CreateParkingDTO } from './dto/create-parking.dto';
import { ParkingService } from './parking.service';

@Controller('parking')
@UseGuards(AuthGuard('jwt'))
export class ParkingController {
  constructor(private parkingService: ParkingService) {}

  @Post('/location')
  async setLocation(@Body() body, @GetUser() user): Promise<void> {
    return this.parkingService.setLocation(body.lat, body.lng, user);
  }

  @Post('/available')
  async setAvailable(@Body('available') available: boolean, @GetUser() user) {
    return this.parkingService.setAvailable(available, user);
  }

  @Post()
  async createParking(
    @Body() createParkingDTO: CreateParkingDTO,
    @GetUser() user,
  ) {
    return this.parkingService.createParking(createParkingDTO, user);
  }
}
