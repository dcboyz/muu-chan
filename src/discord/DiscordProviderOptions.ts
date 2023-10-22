import { Service } from 'typedi'
import { IOptionsMonitor } from '../configuration/IOptionsMonitor'

export interface IDiscordProviderOptions {
  token: string
  clientId: string
}

@Service()
export class DiscordProviderOptions implements IOptionsMonitor<IDiscordProviderOptions> {
  public currentValue() {
    const token = process.env.DISCORD_BOT_TOKEN as string
    const clientId = process.env.DISCORD_CLIENT_ID as string

    const options = { token, clientId }

    return options
  }
}
