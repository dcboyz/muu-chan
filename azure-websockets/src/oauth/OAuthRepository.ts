import { Inject, Service } from 'typedi'

import { CosmosProvider } from '../database/CosmosProvider'

import { IOAuthKey, IOAuthModel, IOAuthRecord } from './IOAuthModel'

import { OAuthRepositoryOptions } from './OAuthRepositoryOptions'

@Service()
export class OAuthRepository {
  @Inject()
  private readonly oAuthRepositoryOptionsMonitor: OAuthRepositoryOptions

  @Inject()
  private readonly cosmosProvider: CosmosProvider

  public async upsertOAuth(key: IOAuthKey, auth: Partial<IOAuthRecord>) {
    const options = this.oAuthRepositoryOptionsMonitor.currentValue()

    await this.cosmosProvider.upsertRecord(options.table, { ...key, ...auth })
  }

  public async getOAuth(key: IOAuthKey) {
    const options = this.oAuthRepositoryOptionsMonitor.currentValue()

    const oauth = await this.cosmosProvider.getRecord<IOAuthModel>(options.table, key.id, key.partitionKey)

    return oauth
  }
}
