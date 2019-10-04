import { HttpStatus, INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { SignUpDTO } from "../src/auth/dto/signup.dto";
import { SocialLoginDTO } from "../src/auth/dto/social-login.dto";
import { SocialProvider } from "../src/auth/enum/provider.enum";
import { UserRepository } from "../src/auth/user.repository";
import { DatabaseModule } from "../src/database/database.module";
import { DatabaseService } from "../src/database/database.service";
import { TestUtils } from "./test.utils";

describe("/auth (e2e)", () => {
  let app: INestApplication;
  let testUtils: TestUtils;

  const fixtureSignUpDTO: SignUpDTO = {
    email: "seedUser@gmail.com",
    password: "password",
    name: "seedUser",
  };

  const fixtureSocialLoginDTO: SocialLoginDTO = {
    email: "seedSocial@gmail.com",
    provider: SocialProvider.GOOGLE,
    thirdPartyID: "fjdakljf",
  };

  let userRepository: UserRepository;
  let accessToken: string;

  beforeEach(async done => {
    const testModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [DatabaseService, UserRepository, TestUtils],
    }).compile();
    testUtils = testModule.get<TestUtils>(TestUtils);
    await testUtils.resetDb();
    app = testModule.createNestApplication();
    await app.init();

    await testUtils.loadFixtures("");

    // Fixtures - send api just for password encrpytion in this case
    const response = await request(app.getHttpServer())
      .post("/auth/signup")
      .send(fixtureSignUpDTO)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    accessToken = response.body.accessToken;
    await request(app.getHttpServer())
      .post("/auth/social-login")
      .send(fixtureSocialLoginDTO)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    done();
    userRepository = testUtils.databaseService.connection.getCustomRepository(
      UserRepository,
    );
  });

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
        // await testUtils.loadFixtures("User");
        // await testUtils.loadFixtures("");
        const response = await request(app.getHttpServer())
          .post("/auth/signup")
          .send(newUser)
          .set("Content-Type", "application/json")
          .set("Accept", "application/json");

        expect(typeof response.body).toBe("object");
        expect(response.body).toHaveProperty("accessToken");
        expect(response.body.accessToken).toBeDefined();
        expect(HttpStatus.CREATED);
      } catch (err) {
        throw err;
      }
    });

    // it("reject duplicate registration", async () => {
    //   try {
    //     const response = await request(app.getHttpServer())
    //       .post("/auth/signup")
    //       .send({ ...fixtureSignUpDTO })
    //       .set("Content-Type", "application/json")
    //       .set("Accept", "application/json");

    //     expect(response.body.message).toEqual("Email already exists");
    //     expect(response.status).toBe(HttpStatus.CONFLICT);
    //   } catch (err) {
    //     throw err;
    //   }
    // });

    // it("signin user", async () => {
    //   const data: SignInDTO = {
    //     email: fixtureSignUpDTO.email,
    //     password: fixtureSignUpDTO.password,
    //   };
    //   try {
    //     const response = await request(app.getHttpServer())
    //       .post("/auth/signin")
    //       .send(data)
    //       .set("Content-Type", "application/json")
    //       .set("Accept", "application/json");

    //     const body = response.body as UserRO;

    //     expect(body).toHaveProperty("accessToken");
    //     expect(body).toHaveProperty("name");
    //     expect(body.name).toEqual(fixtureSignUpDTO.name);
    //     expect(response.status).toEqual(HttpStatus.CREATED);
    //   } catch (err) {
    //     throw err;
    //   }
    // });

    // it("get me", async () => {
    //   try {
    //     const response = await request(app.getHttpServer())
    //       .get("/auth/me")
    //       .set("Authorization", `Bearer ${accessToken}`);

    //     const body = response.body as UserRO;
    //     expect(body).toHaveProperty("name");
    //     expect(body.name).toEqual(fixtureSignUpDTO.name);
    //     expect(body.inUse).toEqual(false);
    //     expect(body.isSharing).toEqual(false);
    //     expect(body.accessToken).toEqual(null);
    //     expect(response.status).toEqual(HttpStatus.OK);
    //   } catch (err) {
    //     throw err;
    //   }
    // });

    // it("reject sending me using incorrect token", async () => {
    //   try {
    //     const response = await request(app.getHttpServer())
    //       .get("/auth/me")
    //       .set("Authorization", `Bearer incorrectToken`);

    //     expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
    //   } catch (err) {
    //     throw err;
    //   }
    // });

    // it("creates new social user and send userRO", async () => {
    //   const sociaLoginDTO: SocialLoginDTO = {
    //     email: "social@gmail.com",
    //     provider: SocialProvider.GOOGLE,
    //     thirdPartyID: "fjdkfjkla",
    //   };
    //   const response = await request(app.getHttpServer())
    //     .post("/auth/social-login")
    //     .send(sociaLoginDTO)
    //     .set("Content-Type", "application/json")
    //     .set("Accept", "application/json");
    //   const found = await userRepository.findOne(sociaLoginDTO);

    //   expect(found.email).toEqual(sociaLoginDTO.email);
    //   expect(response.body).toHaveProperty("accessToken");
    //   expect(response.status).toEqual(HttpStatus.CREATED);
    // });

    // it("login existing social user and not make another user", async () => {
    //   const response = await request(app.getHttpServer())
    //     .post("/auth/social-login")
    //     .send(fixtureSocialLoginDTO)
    //     .set("Content-Type", "application/json")
    //     .set("Accept", "application/json");
    //   const found = await userRepository.find(fixtureSocialLoginDTO);

    //   expect(found.length).toEqual(1);
    //   expect(response.body).toHaveProperty("accessToken");
    //   expect(response.status).toEqual(HttpStatus.CREATED);
    // });
  });
});
