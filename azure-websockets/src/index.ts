import dotenv from "dotenv";
import { Client, Events, GatewayIntentBits, Interaction } from "discord.js";

// That's really only needed for local development
dotenv.config();

import { commandContainer } from "./commands/command-container";
import { registerCommands } from "./commands/register-commands";

async function handleInteraction(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;

  const commandName = interaction.commandName;

  const executor = commandContainer.getExecutorForCommand(commandName);

  await executor(interaction);
}

async function listenToCommands() {
  await registerCommands(commandContainer.getCommands());

  const discordWebsocket = new Client({ intents: [GatewayIntentBits.Guilds] });

  discordWebsocket.on(Events.InteractionCreate, handleInteraction);

  const token = process.env.DISCORD_BOT_TOKEN as string;

  discordWebsocket.login(token);
}

void (async function main() {
  await listenToCommands();
})();
