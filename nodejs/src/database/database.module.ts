import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "../config/typeorm.config";
import { DatabaseService } from "./database.service";

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig)],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
