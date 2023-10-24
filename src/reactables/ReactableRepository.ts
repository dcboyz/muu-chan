import { Inject, Service } from 'typedi'

import { CosmosProvider } from '../database/CosmosProvider'

import { ReactableRepositoryOptions } from './ReactableRepositoryOptions'

import { IReactableKey, IReactableModel, IReactableRecord } from './IReactableModel'

@Service()
export class ReactableRepository {
  @Inject()
  private readonly reactableRepositoryOptionsMonitor: ReactableRepositoryOptions

  @Inject()
  private readonly cosmosProvider: CosmosProvider

  public async upsertReactable(key: IReactableKey, reactable: Partial<IReactableRecord>) {
    const options = this.reactableRepositoryOptionsMonitor.currentValue()

    await this.cosmosProvider.upsertRecord(options.table, { ...key, ...reactable })
  }

  public async getReactable(key: IReactableKey) {
    const options = this.reactableRepositoryOptionsMonitor.currentValue()

    const reactable = await this.cosmosProvider.getRecord<IReactableModel>(options.table, key.id, key.partitionKey)

    return reactable
  }
}
