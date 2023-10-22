import 'reflect-metadata'

import express from 'express'
import dotenv from 'dotenv'
import Container, { Inject, Service } from 'typedi'
import { Events, Interaction } from 'discord.js'

dotenv.config()

import { CommandContainer } from './discord/CommandContainer'
import { DiscordProvider } from './discord/DiscordProvider'

@Service()
class Application {
  @Inject()
  private readonly commandContainer: CommandContainer

  @Inject()
  private readonly discordProvider: DiscordProvider

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
}

function fAzure() {
  const server = express()

  // We need to create this otherwise Azure will kill our App Container...
  server.get('/', (_, res) => res.send())

  server.listen(8080)
}

void (async function main() {
  fAzure()

  const application = Container.get(Application)

  await application.listenToCommands()
})()
