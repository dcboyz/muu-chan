import { Service } from "typedi";

import { IOptionsMonitor } from "../configuration/IOptionsMonitor";

import { IKnexConnectionProviderOptions } from "../database/IKnexConnectionProviderOptions";

import { IOAuthRepositoryOptions } from "./IOAuthRepositoryOptions";

@Service("IOptionsMonitor<IOAuthRepositoryOptions>")
export class OAuthRepositoryOptions implements IOptionsMonitor<IOAuthRepositoryOptions> {
  public currentValue(): IOAuthRepositoryOptions {
    const client = process.env.DATABASE_CLIENT as string;
    const database = process.env.DATABASE_NAME as string;
    const server = process.env.DATABASE_SERVER as string;
    const user = process.env.DATABASE_USER as string;
    const password = process.env.DATABASE_PASSWORD as string;
    const table = process.env.DATABASE_MAL_OAUTH_TABLE as string;

    const oAuthKnexConnectionOptions: IKnexConnectionProviderOptions = {
      client: client,
      connection: {
        database: database,
        server: server,
        user: user,
        password: password,
        table: table,
      },
    };

    const oAuthRepositoryOptions: IOAuthRepositoryOptions = {
      OAuthKnexConnectionOptions: oAuthKnexConnectionOptions,
    };

    return oAuthRepositoryOptions;
  }
}
