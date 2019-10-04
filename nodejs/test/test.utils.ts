import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import {
  Builder,
  fixturesIterator,
  Loader,
  Parser,
  Resolver,
} from "typeorm-fixtures-cli/dist";
import { DatabaseService } from "../src/database/database.service";

/**
 * This class is used to support database
 * tests with unit tests in NestJS.
 *
 * This class is inspired by https://github.com/jgordor
 * https://github.com/nestjs/nest/issues/409#issuecomment-364639051
 */
@Injectable()
export class TestUtils {
  databaseService: DatabaseService;

  /**
   * Creates an instance of TestUtils
   */
  constructor(databaseService: DatabaseService) {
    if (process.env.NODE_ENV !== "test") {
      throw new Error("ERROR-TEST-UTILS-ONLY-FOR-TESTS");
    }
    this.databaseService = databaseService;
  }

  async loadFixtures(fixturesPath: string) {
    const connection = this.databaseService.connection;
    try {
      const loader = new Loader();
      loader.load(path.resolve("./test/fixtures/User.yml"));

      const resolver = new Resolver();
      const fixtures = resolver.resolve(loader.fixtureConfigs);
      const builder = new Builder(connection, new Parser());

      console.log("================");
      console.dir(fixtures);

      for (const fixture of fixturesIterator(fixtures)) {
        const entity: any = await builder.build(fixture);
        (await this.databaseService.getRepository(
          entity.constructor.name,
        )).save(entity);
      }
    } catch (err) {
      throw err;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  /**
   * Shutdown the http server
   * and close database connections
   */
  async shutdownServer(server) {
    await server.httpServer.close();
    await this.closeDbConnection();
  }

  /**
   * Closes the database connections
   */
  async closeDbConnection() {
    const connection = await this.databaseService.connection;
    if (connection.isConnected) {
      await (await this.databaseService.connection).close();
    }
  }

  // async synchronizeDB() {
  //   const connection = await this.databaseService.connection;
  //   if (connection.isConnected) {
  //     await connection.dropDatabase();
  //     return connection.synchronize(true);
  //     // await (await this.databaseService.connection).close();
  //   }
  // }

  /**
   * Returns the entites of the database
   */
  private async getEntities() {
    const entities = [];
    (await (await this.databaseService.connection).entityMetadatas).forEach(x =>
      entities.push({ name: x.name, tableName: x.tableName }),
    );
    return entities;
  }

  /**
   * Cleans the database and reloads the entries
   */
  async reloadFixtures() {
    const entities = await this.getEntities();
    await this.cleanAll(entities);
    await this.loadAll(entities);
  }

  async loadAll(entities) {
    try {
      for (const entity of entities) {
        const repository = await this.databaseService.getRepository(
          entity.name,
        );
        const fixtureFile = path.join(
          __dirname,
          `../test/fixtures/${entity.name}.json`,
        );
        if (fs.existsSync(fixtureFile)) {
          const items = JSON.parse(fs.readFileSync(fixtureFile, "utf8"));
          await repository
            .createQueryBuilder(entity.name)
            .insert()
            .values(items)
            .execute();
        }
      }
    } catch (error) {
      throw new Error(
        `ERROR [TestUtils.loadAll()]: Loading fixtures on test db: ${error}`,
      );
    }
  }

  /**
   * Cleans the database and reloads the entries
   */

  async resetDb() {
    const entities = await this.getEntities();
    await this.cleanAll(entities);
  }

  /**
   * Cleans all the entitie
   */
  private async cleanAll(entities) {
    try {
      for (const entity of entities) {
        const repository = await this.databaseService.getRepository(
          entity.name,
        );
        await repository.query(`DELETE FROM ${entity.tableName};`);
      }
    } catch (error) {
      throw new Error(`ERROR: Cleaning test db: ${error}`);
    }
  }
}
