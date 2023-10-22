import {
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js'
import { Inject, Service } from 'typedi'

import { DiscordProviderOptions } from './DiscordProviderOptions'

@Service()
export class DiscordProvider {
  @Inject()
  private readonly optionsMonitor: DiscordProviderOptions

  private _restClient: REST
  private _wsClient: Client

  private get restClient() {
    if (!this._restClient) {
      const options = this.optionsMonitor.currentValue()

      this._restClient = new REST()

      this._restClient = this._restClient.setToken(options.token)
    }

    return this._restClient
  }

  public get wsClient() {
    if (!this._wsClient) {
      this._wsClient = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
        partials: [Partials.Message, Partials.Channel, Partials.Reaction],
      })
    }

    return this._wsClient
  }

  public async broadcastInChannel(message: EmbedBuilder, name: string) {
    const payload = { embeds: [message] }

    for await (const channel of this.getChannelsByName(name)) {
      await channel.send(payload)
    }
  }

  public async registerCommands(
    commands: (SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>)[],
  ) {
    const options = this.optionsMonitor.currentValue()

    const applicationCommandRoute = Routes.applicationCommands(options.clientId)

    const body = { body: commands }

    await this.restClient.put(applicationCommandRoute, body)
  }

  public async clientLogin() {
    const options = this.optionsMonitor.currentValue()

    await this.wsClient.login(options.token)
  }

  private async *getChannelsByName(name: string) {
    await this.clientLogin()

    const guilds = await this.wsClient.guilds.fetch()

    const seen = new Set()

    for (const [_, guild] of guilds) {
      const channels = guild.client.channels.cache

      for (const [channelId, channel] of channels) {
        if (seen.has(channelId)) continue

        if (channel.isTextBased()) {
          const textChannel = channel as TextChannel

          if (textChannel.name == name) {
            yield channel
          }
        }

        seen.add(channelId)
      }
    }
  }
}
