import { Service } from 'typedi'

import { IOptionsMonitor } from '../configuration/IOptionsMonitor'

interface ICacheProviderOptions {
  url: string
  password: string
}

@Service()
export class CacheProviderOptions implements IOptionsMonitor<ICacheProviderOptions> {
  public currentValue() {
    const url = process.env.REDIS_HOST as string
    const password = process.env.REDIS_PRIMARY_ACCESS_KEY as string

    const cacheProviderOptions: ICacheProviderOptions = {
      url,
      password,
    }

    return cacheProviderOptions
  }
}
