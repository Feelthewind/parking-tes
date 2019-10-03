import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { OrderModule } from "./order/order.module";
import { ParkingModule } from "./parking/parking.module";
import { DatabaseModule } from "./shared/database/database.module";

@Module({
  imports: [
    // TypeOrmModule.forRoot(typeOrmConfig),
    DatabaseModule,
    AuthModule,
    ParkingModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
