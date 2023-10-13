import dotenv from "dotenv";
import path from "path";

import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";

import { command as quickLeetcodeQuestion } from "./commands/quick-leetcode-question.js";

dotenv.config({ path: path.resolve(__dirname, "../", "../", ".env") });

const token = process.env.TOKEN as string;
const clientId = process.env.CLIENT_ID as string;

const quickLeetcodeQuestionSlashCommand = quickLeetcodeQuestion.createCommand();
const slashCommands = [quickLeetcodeQuestionSlashCommand];

// We need to register slashCommands through REST
const discordRestClient = new REST().setToken(token);
discordRestClient.put(Routes.applicationCommands(clientId), { body: slashCommands });

const discordWebsocketServer = new Client({ intents: [GatewayIntentBits.Guilds] });
discordWebsocketServer.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName == quickLeetcodeQuestionSlashCommand.name) {
    await quickLeetcodeQuestion.execute(interaction);
  }
});

discordWebsocketServer.login(token);
