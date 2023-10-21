import "reflect-metadata";

import dotenv from "dotenv";
import express from "express";
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

function fAzure() {
  const server = express();

  // We need to create this otherwise Azure will kill our App Container...
  server.get("/", (_, res) => res.send());

  server.listen(80);
}

void (async function main() {
  fAzure();
  await listenToCommands();
})();
