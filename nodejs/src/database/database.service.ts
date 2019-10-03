import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/typeorm";
import { Connection } from "typeorm";

@Injectable()
export class DatabaseService {
  constructor(@InjectConnection() public connection: Connection) {}

  async getRepository<T>(entity) {
    return this.connection.getRepository(entity);
  }
}
