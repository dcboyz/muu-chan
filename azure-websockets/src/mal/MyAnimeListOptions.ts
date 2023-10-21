import { Service } from 'typedi'
import { IOptionsMonitor } from '../configuration/IOptionsMonitor'
import { IMyAnimeListOptions } from './IMyAnimeListOptions'

@Service('IOptionsMonitor<IMyAnimeListOptions>')
export class MyAnimeListOptions implements IOptionsMonitor<IMyAnimeListOptions> {
  public currentValue() {
    const oauthRedirectUri = process.env.MAL_OAUTH_REDIRECT_URI as string
    const clientId = process.env.MAL_CLIENT_ID as string
    const clientSecret = process.env.MAL_CLIENT_SECRET as string
    const suggestionLimit = process.env.MAL_SUGGESTION_LIMIT as string

    const options: IMyAnimeListOptions = {
      oauthRedirectUri,
      clientId,
      clientSecret,
      suggestions: { limit: suggestionLimit },
    }

    return options
  }
}
