import {
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as moment from "moment";
import { Brackets, getConnection, Repository } from "typeorm";
import { User } from "../auth/user.entity";
import { UserRepository } from "../auth/user.repository";
import { CreateParkingDTO } from "./dto/create-parking.dto";
import { Parking } from "./entity/parking.entity";
import { ParkingImage } from "./entity/parkingImage.entity";
import { Timezone } from "./entity/timezone.entity";

@Injectable()
export class ParkingService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(Parking)
    private parkingRepository: Repository<Parking>,
    @InjectRepository(Timezone)
    private timezoneRepository: Repository<Timezone>,
    @InjectRepository(ParkingImage)
    private imageRepository: Repository<ParkingImage>,
  ) {}

  async setAvailable(isAvailable: boolean, user: User) {
    await this.parkingRepository.update({ userId: user.id }, { isAvailable });
  }

  async createParking(
    createParkingDTO: CreateParkingDTO,
    user: User,
  ): Promise<Parking> {
    const { lat, lng, timezones, price, images } = createParkingDTO;

    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      let parking = this.parkingRepository.create();
      // INSERT INTO "parking"("coordinates", "isAvailable", "fk_user_id", "fk_address_id") VALUES (ST_SetSRID(ST_GeomFromGeoJSON($1),
      // 4326)::geography, $2, $3, $4) RETURNING "id", "isAvailable" -- PARAMETERS: ["{\"type\":\"Point\",\"coordinates\":[37.604165,127.
      // 142494]}",0,1,1]
      parking.coordinates = {
        type: "Point",
        coordinates: [lat, lng],
      };
      parking.isAvailable = false;
      parking.price = price;
      parking.userId = user.id;
      parking = await queryRunner.manager.save(parking);

      // const result = await queryRunner.manager
      //   .createQueryBuilder()
      //   .insert()
      //   .into(Parking)
      //   .values({
      //     isAvailable: false,
      //     userId: user.id,
      //     addressId: newAddress.id,
      //     coordinates: 'ST_SetSRID(ST_MakePoint(:lat, :lng), 4326)::geography',
      //   })
      //   .setParameters({
      //     lat,
      //     lng,
      //   })
      //   .execute();

      // console.dir(result);

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

      const imagesToSave: ParkingImage[] = [];
      for (const image of images) {
        const parkingImage = this.imageRepository.create();
        parkingImage.url = image;
        parkingImage.parkingId = parking.id;
        imagesToSave.push(parkingImage);
      }
      await queryRunner.manager.save(imagesToSave);

      await queryRunner.manager.update(
        User,
        { id: user.id },
        { isSharing: true },
      );

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
      .createQueryBuilder("parking")
      .leftJoinAndSelect("parking.timezones", "timezones")
      .where("parking.id = :id", { id: parkingId })
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
      .to.split(":");

    const current = moment([hours, minutes], "HH:mm");
    const max = moment([maxTime[0], maxTime[1]], "HH:mm");
    let result = max.diff(current, "minutes");
    if (parking.timezones.length === 2) {
      result = result + hoursLeft * 60 + minutesLeft;
    }
    return result;
  }

  async getParkingsByBounds(
    xmin: number,
    ymin: number,
    xmax: number,
    ymax: number,
  ) {
    const parkings = await this.parkingRepository
      .createQueryBuilder("parking")
      .leftJoinAndSelect("parking.timezones", "timezones")
      .leftJoinAndSelect("parking.user", "user")
      .where(
        `ST_Contains(ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 4326), parking.coordinates)`,
      )
      .getMany();

    return parkings.map(parking => parking.toResponseObject());
  }

  async getParkingsByClustering(
    xmin: number,
    ymin: number,
    xmax: number,
    ymax: number,
  ) {
    const userQb = this.parkingRepository
      .createQueryBuilder("parking")
      .select(
        `ST_ClusterKMeans(parking.coordinates, 5) OVER() AS kmean, ST_Centroid(parking.coordinates) as geom`,
      )
      .where(
        `ST_Contains(ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 4326), parking.coordinates)`,
      );

    // ST_AsGeoJSON("parking"."coordinates")::json

    const clusters = await this.parkingRepository
      .createQueryBuilder()
      .select(
        "usr.kmean, count(*), ST_AsGeoJSON(ST_Centroid(ST_SetSRID(ST_Extent(geom), 4326)))::json as center",
      )
      .from("(" + userQb.getQuery() + ")", "usr")
      .groupBy("usr.kmean")
      .getRawMany();

    return clusters.map(cluster => ({
      count: cluster.count,
      center: cluster.center.coordinates,
    }));
  }

  async getParkings(
    usageTime: number,
    lat: number,
    lng: number,
  ): Promise<Parking[]> {
    // 기본 사용시간은 최소 1시간, 최대 8시간
    if (usageTime && (usageTime < 60 || usageTime > 480)) {
      throw new UnprocessableEntityException();
    }

    const end = moment().add(usageTime, "minutes");
    const endDay = end.day();
    const endHours = end.hours();
    const endMinutes = end.minutes();
    const endTime = `${endHours}:${endMinutes}`;

    const date = new Date();
    const day = date.getDay();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const startTime = `${hours}:${minutes}`;

    const origin = {
      type: "Point",
      coordinates: [lat, lng],
    };

    // 사용자 위치 기준으로 1km 반경 안의 주차장만 응답에 포함.
    const query = this.parkingRepository
      .createQueryBuilder("parking")
      .leftJoinAndSelect("parking.timezones", "timezones")
      .where(
        "ST_Distance(parking.coordinates, ST_SetSRID(ST_GeomFromGeoJSON(:origin), 4326)) * 111139 < 1000",
      )
      .setParameters({ origin: JSON.stringify(origin) });

    if (day === endDay) {
      return query
        .andWhere("timezones.day = :day", { day })
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

  async getParkingsByDistance(lat, lng) {
    const origin = {
      type: "Point",
      coordinates: [lat, lng],
    };

    // ST_SetSRID 사용!

    // return getManager().query(
    //   `SELECT ST_Distance(parking.coordinates, ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(
    //     origin,
    //   )}), 4326)) from parking`,
    // );

    // 111139 to get distance as meters!
    return (
      this.parkingRepository
        .createQueryBuilder("parking")
        .where(
          "ST_Distance(parking.coordinates, ST_SetSRID(ST_GeomFromGeoJSON(:origin), 4326)) * 111139 < 1000",
        )
        // .orderBy({
        //   'ST_Distance(parking.coordinates, ST_GeomFromGeoJSON(:origin)': {
        //     order: 'ASC',
        //     nulls: 'NULLS FIRST',
        //   },
        // })
        .setParameters({ origin: JSON.stringify(origin) })
        .getMany()
    );
  }
}
