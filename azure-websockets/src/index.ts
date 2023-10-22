import 'reflect-metadata'

import fastify from 'fastify'
import dotenv from 'dotenv'
import Container, { Inject, Service } from 'typedi'
import { Events, Interaction } from 'discord.js'

dotenv.config()

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

  private readonly server = fastify()

  handleInteraction = async (interaction: Interaction) => {
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
    // Answer to healthcheck ping from Azure
    this.server.get('/', (_, res) => res.send())

    this.server.get('/maloauthcallback', this.myAnimeListRequestHandler.handleOAuthCallback)

    this.server.listen({ port: 80 })
  }
}

void (async function main() {
  const application = Container.get(Application)

  application.handleHttpRequests()

  await application.listenToCommands()
})()
