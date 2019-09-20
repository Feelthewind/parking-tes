import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "../auth/get-user.decorator";
import { OwnerGuard } from "../shared/owner.guard";
import { ValidationPipe } from "../shared/validation.pipe";
import { CreateParkingDTO } from "./dto/create-parking.dto";
import { Parking } from "./entity/parking.entity";
import { ParkingService } from "./parking.service";

@Controller("parking")
@UsePipes(new ValidationPipe())
@UseGuards(AuthGuard("jwt"))
export class ParkingController {
  constructor(private parkingService: ParkingService) {}

  @Patch("/available")
  @UseGuards(new OwnerGuard())
  async setAvailable(@Body("available") available: boolean, @GetUser() user) {
    return this.parkingService.setAvailable(available, user);
  }

  @Post()
  async createParking(
    @Body() createParkingDTO: CreateParkingDTO,
    @GetUser() user,
  ) {
    return this.parkingService.createParking(createParkingDTO, user);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getParkings(
    @Query("usageTime") usageTime: number,
    @Query("lat") lat: number,
    @Query("lng") lng: number,
  ): Promise<Parking[]> {
    return this.parkingService.getParkings(usageTime, lat, lng);
  }

  @Get("/extension/:parkingId")
  async getTimeToExtend(@Param("parkingId") parkingId: number) {
    return this.parkingService.getTimeToExtend(parkingId);
  }

  @Get("/distance")
  async getParkingsByDistance(
    @Query("lat") lat: number,
    @Query("lng") lng: number,
  ) {
    return this.parkingService.getParkingsByDistance(lat, lng);
  }
}
