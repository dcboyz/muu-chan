import fastify from 'fastify'
import cron from 'node-cron'
import { Inject, Service } from 'typedi'
import { CacheType, Events, Interaction, MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js'

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

  handleReactable = async (reaction: MessageReaction | PartialMessageReaction, _: User | PartialUser) => {
    // Bot is reacting to itself.
    if (_.bot) return

    const message = await reaction.message.fetch()

    const commandName = message.interaction?.commandName

    if (!commandName) {
      return
    }

    const executor = this.commandContainer.getReactableForCommand(commandName)

    if (!executor) {
      return
    }

    await executor.execute(reaction, message.interaction?.user.id!)
  }

  public async listenToCommands() {
    await this.discordProvider.registerCommands(this.commandContainer.getCommands())

    this.discordProvider.wsClient.on(Events.InteractionCreate, this.handleInteraction)

    this.discordProvider.wsClient.on(Events.MessageReactionAdd, this.handleReactable)

    // TODO: Temporary, as we need to separetely handle this.
    this.discordProvider.wsClient.on(Events.MessageReactionRemove, this.handleReactable)

    await this.discordProvider.clientLogin()
  }

  public async handleHttpRequests() {
    const options = this.applicationOptions.currentValue()

    // Answer to healthcheck ping from Azure
    this.server.get('/', (_, res) => res.status(200).send({ pong: true }))

    this.server.get('/maloauthcallback', this.myAnimeListRequestHandler.handleOAuthCallback)

    this.server.listen({ port: options.httpPort, host: '0.0.0.0' }, (err, addr) => {
      if (err) {
        console.error(err)
      }

      console.log('HTTP Listening on: ' + addr)
    })
  }

  public async handleCron() {
    cron.schedule('30 17 * * *', this.leetcodeCronHandler.getRandomLeetcodeQuestion)
  }
}
