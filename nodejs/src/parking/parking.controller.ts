import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { OwnerGuard } from '../shared/owner.guard';
import { UserGuard } from '../shared/user.guard';
import { ValidationPipe } from '../shared/validation.pipe';
import { CreateParkingDTO } from './dto/create-parking.dto';
import { Parking } from './parking.entity';
import { ParkingService } from './parking.service';

@Controller('parking')
@UsePipes(new ValidationPipe())
@UseGuards(AuthGuard('jwt'))
export class ParkingController {
  constructor(private parkingService: ParkingService) {}

  @Patch('/location')
  async setLocation(@Body() body, @GetUser() user): Promise<void> {
    return this.parkingService.setLocation(body.lat, body.lng, user);
  }

  @Patch('/available')
  @UseGuards(new OwnerGuard())
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
  @UseGuards(new UserGuard())
  async createOffer(@Body('parkingId') parkingId: number, @GetUser() user) {
    return this.parkingService.createOffer(parkingId, user);
  }

  @Post('/offer/accept')
  @UseGuards(new OwnerGuard())
  async acceptOffer(@Body('buyerId') buyerId: number, @GetUser() user) {
    return this.parkingService.acceptOffer(buyerId, user);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getParkings(): Promise<Parking[]> {
    return this.parkingService.getParkings();
  }
}
