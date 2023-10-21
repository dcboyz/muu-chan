import knex from 'knex'
import { Service } from 'typedi'

import { IKnexConnectionProvider } from './IKnexConnectionProvider'
import { IKnexConnectionProviderOptions } from './IKnexConnectionProviderOptions'

@Service('IKnexConnectionProvider')
export class KnexConnectionProvider<TTable extends {}> implements IKnexConnectionProvider<TTable> {
  public createDatabaseConnection(options: IKnexConnectionProviderOptions) {
    const knexConfiguration: knex.Knex.Config = {
      client: options.client,
      connection: {
        server: options.connection.server,
        database: options.connection.database,
        user: options.connection.user,
        password: options.connection.password,
        options: {
          encrypt: true,
        },
      },
    }

    const connection = knex<TTable>(knexConfiguration)

    return () => connection(options.connection.table)
  }
}
