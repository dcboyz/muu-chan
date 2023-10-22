import { Inject, Service } from 'typedi'

import { chooseRandom } from '../common/arrays'

import { CacheProvider } from '../cache/CacheProvider'

@Service()
export class WaifuProvider {
  private static readonly baseUri = 'https://api.waifu.pics/many/sfw/'

  private static readonly categories = [
    'waifu',
    'bully',
    'cuddle',
    'hug',
    'awoo',
    'pat',
    'smug',
    'bonk',
    'yeet',
    'blush',
    'smile',
    'wave',
    'nom',
    'glomp',
    'slap',
    'happy',
    'wink',
    'poke',
    'cringe',
  ]

  // For some reason in the universe, the waifu api requires a body without content...
  private static readonly body = JSON.stringify({})

  @Inject()
  private readonly cacheProvider: CacheProvider

  public async getRandomWaifuImageOrGifUri(): Promise<string> {
    const category = chooseRandom(WaifuProvider.categories)

    const cacheKey = 'waifu:' + category

    const cached = await this.cacheProvider.get<string[]>(cacheKey)

    if (cached) {
      const url = chooseRandom(cached)

      return url
    }

    const headers = { 'Content-Type': 'application/json' }

    const requestOptions = { method: 'POST', body: WaifuProvider.body, headers: headers }

    const response = await fetch(WaifuProvider.baseUri + category, requestOptions)

    const { files } = await response.json()

    const urls = files as string[]

    await this.cacheProvider.set<string[]>(cacheKey, urls, 86400)

    const url = chooseRandom(urls)

    return url
  }
}
