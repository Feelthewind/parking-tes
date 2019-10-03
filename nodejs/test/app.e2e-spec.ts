// import { HttpStatus } from "@nestjs/common";
// import * as path from "path";
// import "reflect-metadata";
// import * as request from "supertest";
// import { getConnectionManager } from "typeorm";
// import { SignUpDTO } from "../src/auth/dto/signup.dto";

// describe("AppController (e2e)", () => {
//   let app = "http://localhost:3000";
//   let connection;

//   beforeAll(async () => {
//     console.log("=====dirname==========");
//     console.log(__dirname);
//     console.log(__dirname + "/../**/*.entity.{js,ts}");
//     console.log(path.join(__dirname, "..\\") + "src\\**\\*.entity.{js,ts}");
//     console.log(__dirname + "../src/**/*.entity.{js,ts}");
//     const connectionManager = getConnectionManager();
//     connection = connectionManager.create({
//       type: "postgres",
//       host: "localhost",
//       port: 5432,
//       username: "postgres",
//       password: "password",
//       database: "parking",
//       entities: [__dirname + "../src/**/*.entity.{js,ts}"],
//     });
//     await connection.connect();
//     // await connection.dropDatabase();
//   });

//   afterAll(async done => {
//     await connection.close();
//     done();
//   });

//   describe("AUTH", () => {
//     const user: SignUpDTO = {
//       email: "email@gmail.com",
//       password: "password",
//       name: "tester",
//     };

//     let userToken: string;

//     it("should register user", () => {
//       return request(app)
//         .post("/auth/signup")
//         .set("Accept", "application/json")
//         .send(user)
//         .expect(({ body }) => {
//           expect(body).toBeDefined();
//         })
//         .expect(HttpStatus.CREATED);
//     });
//   });

//   it("/ (GET)", () => {
//     return request(app)
//       .get("/")
//       .expect(200)
//       .expect("Hello World!");
//   });
// });

import { HttpStatus, INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { SignInDTO } from "../src/auth/dto/signin.dto";
import { SignUpDTO } from "../src/auth/dto/signup.dto";
import { UserRO } from "../src/auth/ro/user.ro";
import { UserRepository } from "../src/auth/user.repository";
import { DatabaseModule } from "../src/shared/database/database.module";
import { DatabaseService } from "../src/shared/database/database.service";
import { TestUtils } from "./test.utils";

describe("/auth (e2e)", () => {
  let app: INestApplication;
  let testUtils: TestUtils;

  const signUpDTO: SignUpDTO = {
    email: "test@gmail.com",
    password: "password",
    name: "tester",
  };

  let userRepository: UserRepository;

  beforeEach(async done => {
    const module = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [DatabaseService, UserRepository, TestUtils],
    }).compile();
    testUtils = module.get<TestUtils>(TestUtils);
    await testUtils.resetDb();
    // await testUtils.reloadFixtures();
    userRepository = testUtils.databaseService.connection.getCustomRepository(
      UserRepository,
    );
    app = module.createNestApplication();
    await app.init();
    await request(app.getHttpServer())
      .post("/auth/signup")
      .send(signUpDTO)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    // userFixture = await userRepository.save({
    //   name: "fixture",
    //   email: "fixture@gmail.com",
    //   password: "password",
    // });
    done();
  });

  // beforeEach(async () => {
  //   const testingModule = await Test.createTestingModule({
  //     imports: [AppModule, DatabaseModule],
  //     providers: [DatabaseService, TestUtils, FixturesService],
  //   }).compile();

  //   testUtils = testingModule.get<TestUtils>(TestUtils);
  //   // fixturesModule = testingModule.select<FixturesModule>(FixturesModule);
  //   // fixturesService = testingModule.get<FixturesService>(FixturesService);
  //   fixturesService = fixturesModule.get<FixturesService>(FixturesService);

  //   // await testUtils.resetDb();
  //   // await testUtils.dropDB();
  //   app = testingModule.createNestApplication();
  //   await app.init();
  // });
  afterEach(async done => {
    await testUtils.resetDb();
    await testUtils.closeDbConnection();
    done();
  });

  describe("AUTH", () => {
    const newUser: SignUpDTO = {
      email: "newUser@gmail.com",
      password: "password",
      name: "newUser",
    };

    it("signup user", async () => {
      try {
        const response = await request(app.getHttpServer())
          .post("/auth/signup")
          .send(newUser)
          .set("Content-Type", "application/json")
          .set("Accept", "application/json");

        expect(response.status).toBe(201);
        expect(typeof response.body).toBe("object");
        expect(response.body).toHaveProperty("accessToken");
        expect(response.body.accessToken).toBeDefined();
        expect(HttpStatus.CREATED);
      } catch (err) {
        throw err;
      }
    });

    it("reject duplicate registration", async () => {
      try {
        const response = await request(app.getHttpServer())
          .post("/auth/signup")
          .send({ ...signUpDTO })
          .set("Content-Type", "application/json")
          .set("Accept", "application/json");

        expect(response.body.message).toEqual("Email already exists");
        expect(response.status).toBe(HttpStatus.CONFLICT);
      } catch (err) {
        throw err;
      }
    });

    it("signin user", async () => {
      const data: SignInDTO = {
        email: signUpDTO.email,
        password: signUpDTO.password,
      };
      try {
        const response = await request(app.getHttpServer())
          .post("/auth/signin")
          .send(data)
          .set("Content-Type", "application/json")
          .set("Accept", "application/json");

        const body = response.body as UserRO;

        expect(body).toHaveProperty("accessToken");
        expect(body).toHaveProperty("name");
        expect(body.name).toEqual(signUpDTO.name);
        expect(response.status).toEqual(HttpStatus.CREATED);
      } catch (err) {
        throw err;
      }
    });
  });
});
