import { REST, Routes } from "discord.js";

import { SlashCommand } from "./commands/common-types";

export async function registerCommands(commands: SlashCommand[]) {
  const token = process.env.TOKEN as string;
  const clientId = process.env.CLIENT_ID as string;

  // We need to register slashCommands through REST
  const discordRestClient = new REST().setToken(token);

  const applicationCommandRoute = Routes.applicationCommands(clientId);

  await discordRestClient.put(applicationCommandRoute, { body: commands });
}
