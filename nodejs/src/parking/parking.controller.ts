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
export class ParkingController {
  constructor(private parkingService: ParkingService) {}

  @Patch("/available")
  @UseGuards(AuthGuard("jwt"))
  @UseGuards(new OwnerGuard())
  async setAvailable(@Body("available") available: boolean, @GetUser() user) {
    return this.parkingService.setAvailable(available, user);
  }

  @Post()
  @UseGuards(AuthGuard("jwt"))
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

  @Get("/bounds")
  async getParkingsByBounds(
    @Query("xmin") xmin: number,
    @Query("ymin") ymin: number,
    @Query("xmax") xmax: number,
    @Query("ymax") ymax: number,
  ) {
    return this.parkingService.getParkingsByBounds(xmin, ymin, xmax, ymax);
  }

  @Get("/clustering")
  getParkingsByClustering(
    @Query("xmin") xmin: number,
    @Query("ymin") ymin: number,
    @Query("xmax") xmax: number,
    @Query("ymax") ymax: number,
  ) {
    return this.parkingService.getParkingsByClustering(xmin, ymin, xmax, ymax);
  }
}
