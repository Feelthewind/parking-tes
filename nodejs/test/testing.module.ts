import { Module } from "@nestjs/common";
import { DatabaseModule } from "../src/shared/database/database.module";

@Module({
  imports: [DatabaseModule],
})
export class TestingModule {
  constructor() {}
}
