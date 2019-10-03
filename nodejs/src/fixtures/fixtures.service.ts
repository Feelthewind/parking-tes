import { Injectable } from "@nestjs/common";
import { AuthService } from "../../src/auth/auth.service";
import { SignUpDTO } from "../../src/auth/dto/signup.dto";
import { UserRO } from "../../src/auth/ro/user.ro";
import { userData } from "./data/user.data";

@Injectable()
export class FixturesService {
  public userRawData: SignUpDTO[];

  constructor(private readonly authService: AuthService) {
    this.userRawData = userData;
  }

  public injectUsers(): Promise<UserRO[]> {
    return Promise.all(
      this.userRawData.map(user => this.authService.signUp(user)),
    );
  }
}
