import { Logger } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm";
import { Timezone } from "../entity/timezone.entity";

@EntityRepository(Timezone)
export class TimezoneRepository extends Repository<Timezone> {
  private logger = new Logger("TimezoneRepository");
}
