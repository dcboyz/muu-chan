import { REST, Routes } from 'discord.js'

import { SlashCommand } from './common-types'

export async function registerCommands(commands: SlashCommand[]) {
  const token = process.env.DISCORD_BOT_TOKEN as string
  const clientId = process.env.DISCORD_BOT_CLIENT_ID as string

  // We need to register slashCommands through REST
  const discordRestClient = new REST().setToken(token)

  const applicationCommandRoute = Routes.applicationCommands(clientId)

  await discordRestClient.put(applicationCommandRoute, { body: commands })
}
