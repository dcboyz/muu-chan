import { Inject, Service } from 'typedi'
import { RedisClientType, createClient } from 'redis'

import { CacheProviderOptions } from './CacheProviderOptions'

@Service()
export class CacheProvider {
  @Inject()
  public readonly cacheProviderOptions: CacheProviderOptions

  private _cache: RedisClientType

  public async set<T>(key: string, value: T, ttl: number | undefined | null) {
    const cache = await this.getCache()

    const serialized = JSON.stringify(value)

    if (ttl) {
      await cache.set(key, serialized, { EX: ttl })
    } else {
      await cache.set(key, serialized)
    }
  }

  public async get<T>(key: string) {
    const cache = await this.getCache()

    const value = await cache.get(key)

    if (value) {
      const deserialized = JSON.parse(value) as T

      return deserialized
    }

    return null
  }

  private async getCache() {
    if (!this._cache) {
      const options = this.cacheProviderOptions.currentValue()

      this._cache = createClient({
        url: options.url,
        password: options.password,
      })

      await this._cache.connect()
    }

    return this._cache
  }
}
