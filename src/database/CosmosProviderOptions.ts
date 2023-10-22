import { Service } from 'typedi'
import { IOptionsMonitor } from '../configuration/IOptionsMonitor'

interface ICosmosProviderOptions {
  endpoint: string
  key: string
  database: string
}

@Service()
export class CosmosProviderOptions implements IOptionsMonitor<ICosmosProviderOptions> {
  public currentValue() {
    const endpoint = process.env.COSMOS_ENDPOINT as string
    const key = process.env.COSMOS_KEY as string
    const database = process.env.COSMOS_DATABASE as string

    const cosmosProviderOptions: ICosmosProviderOptions = {
      endpoint,
      key,
      database,
    }

    return cosmosProviderOptions
  }
}
