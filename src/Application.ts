import fastify from 'fastify'
import cron from 'node-cron'
import { Inject, Service } from 'typedi'
import { CacheType, Events, Interaction } from 'discord.js'

import { LeetcodeCronHandler } from './cron/LeetcodeCronHandler'

import { CommandContainer } from './discord/CommandContainer'
import { DiscordProvider } from './discord/DiscordProvider'

import { MyAnimeListRequestHandler } from './http/MyAnimeListRequestHandler'

import { ApplicationOptions } from './ApplicationOptions'

@Service()
export class Application {
  @Inject()
  private readonly commandContainer: CommandContainer

  @Inject()
  private readonly discordProvider: DiscordProvider

  @Inject()
  private readonly myAnimeListRequestHandler: MyAnimeListRequestHandler

  @Inject()
  private readonly leetcodeCronHandler: LeetcodeCronHandler

  @Inject()
  private readonly applicationOptions: ApplicationOptions

  private readonly server = fastify()

  handleInteraction = async (interaction: Interaction<CacheType>) => {
    if (!interaction.isChatInputCommand()) return

    const commandName = interaction.commandName

    const executor = this.commandContainer.getExecutorForCommand(commandName)

    await executor.execute(interaction)
  }

  public async listenToCommands() {
    await this.discordProvider.registerCommands(this.commandContainer.getCommands())

    this.discordProvider.wsClient.on(Events.InteractionCreate, this.handleInteraction)

    await this.discordProvider.clientLogin()
  }

  public async handleHttpRequests() {
    const options = this.applicationOptions.currentValue()

    // Answer to healthcheck ping from Azure
    this.server.get('/', (_, res) => res.send())

    this.server.get('/maloauthcallback', this.myAnimeListRequestHandler.handleOAuthCallback)

    console.log('HTTP listening on: ' + options.httpPort)

    this.server.listen({ port: options.httpPort }, (err, addr) => {
      console.log('HTTP Listening on: ' + addr)
    })
  }

  public async handleCron() {
    cron.schedule('30 17 * * *', this.leetcodeCronHandler.getRandomLeetcodeQuestion)
  }
}
