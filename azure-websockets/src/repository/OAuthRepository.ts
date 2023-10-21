import knex from "knex";
import { Inject, Service } from "typedi";

import { IOptionsMonitor } from "../configuration/IOptionsMonitor";

import { IKnexConnectionProvider } from "../data/IKnexConnectionProvider";

import { IOAuthKey, IOAuthModel, IOAuthRecord } from "./models/OAuthModel";

import { IOAuthRepository } from "./IOAuthRepository";
import { IOAuthRepositoryOptions } from "./IOAuthRepositoryOptions";

@Service("IOAuthRepository")
export class OAuthRepository implements IOAuthRepository {
  @Inject("IOptionsMonitor<IOAuthRepositoryOptions>")
  private readonly oAuthRepositoryOptionsMonitor: IOptionsMonitor<IOAuthRepositoryOptions>;

  @Inject("IKnexConnectionProvider")
  private readonly knexConnectionProvider: IKnexConnectionProvider<IOAuthModel>;

  private _connection: () => knex.Knex.QueryBuilder<IOAuthModel>;

  // Connection should act as a singleton, as there is internal handling
  // for connection pools.
  private get connection() {
    if (!this._connection) {
      const options = this.oAuthRepositoryOptionsMonitor.currentValue();

      const knexConnectionOptions = options.OAuthKnexConnectionOptions;

      this._connection = this.knexConnectionProvider.createDatabaseConnection(knexConnectionOptions);
    }

    return this._connection();
  }

  public async upsertOAuth(key: IOAuthKey, auth: Partial<IOAuthRecord>) {
    try {
      // an error is expected in case of not found.
      await this.connection.where(key).update(auth);
    } catch (error) {
      await this.connection.insert({ ...key, ...auth });
    }
  }

  public async getOAuth(key: IOAuthKey) {
    const oauth = await this.connection.select<IOAuthRecord>().where(key);

    return oauth;
  }
}
