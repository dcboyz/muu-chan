import dotenv from "dotenv";
import path from "path";

import { Client, Events, GatewayIntentBits } from "discord.js";

import { commandContainer } from "./command-container";

import { registerCommands } from "./rest";

dotenv.config({ path: path.resolve(__dirname, "../", "../", ".env") });

function listenToCommands() {
  // For some reason we need to register commands through REST first
  registerCommands(commandContainer.getCommands())
    .then(() => console.log("Successfully registered commands"));

  const discordWebsocket = new Client({ intents: [GatewayIntentBits.Guilds] });

  discordWebsocket.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const commandName = interaction.commandName;

    const executor = commandContainer.getExecutorForCommand(commandName);

    await executor(interaction);
  });

  const token = process.env.TOKEN as string;

  discordWebsocket.login(token);
}

listenToCommands();
