import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { OwnerGuard } from '../shared/owner.guard';
import { ValidationPipe } from '../shared/validation.pipe';
import { CreateParkingDTO } from './dto/create-parking.dto';
import { Parking } from './parking.entity';
import { ParkingService } from './parking.service';

@Controller('parking')
@UsePipes(new ValidationPipe())
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
  @UseGuards(new OwnerGuard())
  async createParking(
    @Body() createParkingDTO: CreateParkingDTO,
    @GetUser() user,
  ) {
    return this.parkingService.createParking(createParkingDTO, user);
  }

  @Post('/offer')
  async createOffer(@Body('parkingId') parkingId: number, @GetUser() user) {
    this.parkingService.createOffer(parkingId, user);
  }

  @Post('/offer/accept')
  async acceptOffer(@Body('parkingId') parkingId: number, @GetUser() user) {
    await this.parkingService.acceptOffer(parkingId, user);
  }

  @Get()
  async getParkings(): Promise<Parking[]> {
    return this.parkingService.getParkings();
  }
}
