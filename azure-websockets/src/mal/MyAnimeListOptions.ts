import { Service } from 'typedi'

import { IOptionsMonitor } from '../configuration/IOptionsMonitor'

export interface IMyAnimeListOptions {
  oauthRedirectUri: string
  clientId: string
  clientSecret: string
}

@Service()
export class MyAnimeListOptions implements IOptionsMonitor<IMyAnimeListOptions> {
  public currentValue() {
    const oauthRedirectUri = process.env.MAL_OAUTH_REDIRECT_URI as string
    const clientId = process.env.MAL_CLIENT_ID as string
    const clientSecret = process.env.MAL_CLIENT_SECRET as string

    const options: IMyAnimeListOptions = {
      oauthRedirectUri,
      clientId,
      clientSecret,
    }

    return options
  }
}
