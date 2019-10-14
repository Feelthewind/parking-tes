import { HttpStatus, INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as queryString from "querystring";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { SignUpDTO } from "../src/auth/dto/signup.dto";
import { DatabaseModule } from "../src/database/database.module";
import { DatabaseService } from "../src/database/database.service";
import { CreateParkingDTO } from "../src/parking/dto/create-parking.dto";
import { ParkingRepository } from "../src/parking/repository/parking.repository";
import { ParkingRO } from "../src/parking/ro/parking.ro";
import { TestUtils } from "./test.utils";

describe("/parking (e2e)", () => {
  let app: INestApplication;
  let testUtils: TestUtils;

  const fixtureSignUpDTO1: SignUpDTO = {
    email: "fixtureUser@gmail.com",
    password: "password",
    name: "fixtureUser",
  };
  const fixtureSignUpDTO2: SignUpDTO = {
    email: "fixtureUser2@gmail.com",
    password: "password",
    name: "fixtureUser",
  };
  const fixtureSignUpDTO3: SignUpDTO = {
    email: "fixtureUser3@gmail.com",
    password: "password",
    name: "fixtureUser",
  };

  // 37.604129, 127.142463 => 구리 우체국 (in bounds)
  // 37.619551, 127.115143 => 갈매동 (out of bounds)
  const fixtureCreateParkingDTOWithin: Partial<CreateParkingDTO> = {
    description: "fixtureParking1",
    images: ["http://image.com/image.png", "http://image.com/image2.png"],
    isAvailable: true,
    lat: 37.604557,
    lng: 127.140326,
    price: 300,
    timezones: [{ day: 0, from: "18:00:00", to: "23:00:00" }],
  };
  const fixtureCreateParkingDTOOutof: Partial<CreateParkingDTO> = {
    description: "fixtureParking2",
    images: ["http://image.com/image.png", "http://image.com/image2.png"],
    isAvailable: true,
    lat: 37.619551,
    lng: 127.115143,
    price: 300,
    timezones: [{ day: 0, from: "18:00:00", to: "23:00:00" }],
  };
  let fixtureParkingWithinBounds: ParkingRO;
  let fixtureParkingOutofBounds: ParkingRO;

  let parkingRepository: ParkingRepository;
  let providerToken: string;
  let secondProviderToken: string;
  let userToken: string;

  beforeEach(async done => {
    const testModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [DatabaseService, TestUtils],
    }).compile();
    testUtils = testModule.get<TestUtils>(TestUtils);
    // await testUtils.synchronizeDB();
    // await testUtils.reloadFixtures();

    app = testModule.createNestApplication();
    await app.init();

    parkingRepository = testUtils.databaseService.connection.getCustomRepository(
      ParkingRepository,
    );
    // Fixtures - send api  for password encrpytion and to get accessToken in this case instend of using repository
    const userResponse1 = await request(app.getHttpServer())
      .post("/auth/signup")
      .send(fixtureSignUpDTO1);
    providerToken = userResponse1.body.accessToken;

    const userResponse2 = await request(app.getHttpServer())
      .post("/auth/signup")
      .send(fixtureSignUpDTO2);
    secondProviderToken = userResponse2.body.accessToken;

    const userResponse3 = await request(app.getHttpServer())
      .post("/auth/signup")
      .send(fixtureSignUpDTO3);
    userToken = userResponse3.body.accessToken;

    fixtureParkingWithinBounds = (await request(app.getHttpServer())
      .post("/parking")
      .send(fixtureCreateParkingDTOWithin)
      .set("Authorization", `Bearer ${providerToken}`)).body;
    fixtureParkingOutofBounds = (await request(app.getHttpServer())
      .post("/parking")
      .send(fixtureCreateParkingDTOOutof)
      .set("Authorization", `Bearer ${secondProviderToken}`)).body;

    done();
  });

  afterEach(async done => {
    // await testUtils.dropDB();
    await testUtils.closeDbConnection();
    done();
  });

  describe("PARKING", () => {
    describe("POST /parking", () => {
      const newParking: CreateParkingDTO = {
        description: "description",
        images: ["fjdkjf"],
        isAvailable: false,
        lat: 23.42204,
        lng: 32.42425,
        price: 300,
        timezones: [
          {
            day: 0,
            from: "11:48:28",
            to: "15:48:28",
          },
        ],
      };
      it("should create parking", async () => {
        try {
          // await testUtils.loadFixtures("./fixtures");
          const response = await request(app.getHttpServer())
            .post("/parking")
            .send(newParking)
            .set("Authorization", `Bearer ${userToken}`);

          const body: ParkingRO = response.body;

          // const found = await parkingRepository.findOne({
          //   id: body.id,
          //   description: body.description,
          // });

          // expect(found.description).toEqual(newParking.description);
          expect(typeof response.body).toBe("object");
          expect(body.description).toBeDefined();
          expect(body.price).toBeDefined();
          expect(response.status).toEqual(HttpStatus.CREATED);
        } catch (err) {
          throw err;
        }
      });

      it("should reject duplicate parking from the same user", async () => {
        await request(app.getHttpServer())
          .post("/parking")
          .send(newParking)
          .set("Authorization", `Bearer ${userToken}`);

        const response = await request(app.getHttpServer())
          .post("/parking")
          .send(newParking)
          .set("Authorization", `Bearer ${userToken}`);

        expect(response.status).toEqual(HttpStatus.CONFLICT);
      });
    });

    describe("GET /bounds", () => {
      it("should send parkings within bounds", async () => {
        const queryObject = {
          xmin: 37.597455,
          ymin: 127.136038,
          xmax: 37.61161,
          ymax: 127.154324,
        };
        const response = await request(app.getHttpServer()).get(
          `/parking/bounds?${queryString.stringify(queryObject)}`,
        );
        const result: { parkings: ParkingRO[] } = response.body;
        expect(result.parkings.length).toEqual(1);
        expect(result.parkings[0].description).toEqual(
          fixtureCreateParkingDTOWithin.description,
        );
      });

      // it("should not send parkings out of bounds", async () => {});
    });
  });
});
