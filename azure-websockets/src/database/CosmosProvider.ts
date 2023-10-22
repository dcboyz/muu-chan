import { Inject, Service } from 'typedi'
import { CosmosClient, Database } from '@azure/cosmos'

import { CosmosProviderOptions } from './CosmosProviderOptions'
import { ICosmosItem } from './ICosmosItem'

@Service()
export class CosmosProvider {
  @Inject()
  private readonly cosmosProviderOptions: CosmosProviderOptions

  private static readonly defaultPartitionKeyPaths = ['/partitionKey']

  private _client: CosmosClient

  private _database: Database

  public async upsertRecord<T extends ICosmosItem>(containerId: string, record: T) {
    const database = await this.getDatabase()

    const { container } = await database.containers.createIfNotExists({
      id: containerId,
      partitionKey: {
        paths: CosmosProvider.defaultPartitionKeyPaths,
      },
    })

    const resource = await container.items.upsert(record)

    return resource.statusCode
  }

  public async getRecord<T extends ICosmosItem>(containerId: string, id: string, partitionKey: string) {
    const database = await this.getDatabase()

    const { container } = await database.containers.createIfNotExists({
      id: containerId,
      partitionKey: {
        paths: CosmosProvider.defaultPartitionKeyPaths,
      },
    })

    const { resource } = await container.item(id, partitionKey).read()

    if (resource) {
      return resource as T
    }

    return null
  }

  private async getDatabase() {
    if (!this._client) {
      const options = this.cosmosProviderOptions.currentValue()

      this._client = new CosmosClient({ endpoint: options.endpoint, key: options.key })

      const { database } = await this._client.databases.createIfNotExists({ id: options.database })

      this._database = database
    }

    return this._database
  }
}
