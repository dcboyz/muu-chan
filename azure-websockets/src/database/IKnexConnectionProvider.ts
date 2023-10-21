import knex from 'knex'

import { IKnexConnectionProviderOptions } from './IKnexConnectionProviderOptions'

export interface IKnexConnectionProvider<TTable extends {}> {
  createDatabaseConnection(
    knexConnectionProviderOptionsMonitor: IKnexConnectionProviderOptions,
  ): () => knex.Knex.QueryBuilder<TTable>
}
