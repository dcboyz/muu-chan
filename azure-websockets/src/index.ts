import 'reflect-metadata'

import fastify from 'fastify'
import cron from 'node-cron'
import dotenv from 'dotenv'
import Container, { Inject, Service } from 'typedi'
import { CacheType, Events, Interaction } from 'discord.js'

dotenv.config()

import { LeetcodeCronHandler } from './cron/LeetcodeCronHandler'

import { CommandContainer } from './discord/CommandContainer'
import { DiscordProvider } from './discord/DiscordProvider'

import { MyAnimeListRequestHandler } from './http/MyAnimeListRequestHandler'

@Service()
class Application {
  @Inject()
  private readonly commandContainer: CommandContainer

  @Inject()
  private readonly discordProvider: DiscordProvider

  @Inject()
  private readonly myAnimeListRequestHandler: MyAnimeListRequestHandler

  @Inject()
  private readonly leetcodeCronHandler: LeetcodeCronHandler

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

    this.discordProvider.wsClient.on(Events.MessageReactionAdd, async (reaction, user) => {
      console.log(reaction)
    })

    await this.discordProvider.clientLogin()
  }

  public async handleHttpRequests() {
    // Answer to healthcheck ping from Azure
    this.server.get('/', (_, res) => res.send())

    this.server.get('/maloauthcallback', this.myAnimeListRequestHandler.handleOAuthCallback)

    this.server.listen({ port: 4000 })
  }

  public async handleCron() {
    cron.schedule('30 17 * * *', this.leetcodeCronHandler.getRandomLeetcodeQuestion)
  }
}

void (async function main() {
  const application = Container.get(Application)

  application.handleHttpRequests()

  application.handleCron()

  await application.listenToCommands()
})()
