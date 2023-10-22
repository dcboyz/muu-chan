import { Service } from 'typedi'

import { IOptionsMonitor } from '../configuration/IOptionsMonitor'

export interface IOAuthRepositoryOptions {
  table: string
}

@Service()
export class OAuthRepositoryOptions implements IOptionsMonitor<IOAuthRepositoryOptions> {
  public currentValue(): IOAuthRepositoryOptions {
    const table = process.env.DATABASE_MAL_OAUTH_TABLE as string

    const oauthRepositoryOptions: IOAuthRepositoryOptions = {
      table: table,
    }

    return oauthRepositoryOptions
  }
}
