import { Interaction, SlashCommandBuilder } from "discord.js";

import { ActualInteraction } from "./common-types";

import { createEmbed } from "../../helpers/discord";

import { getAskForUserPermissionsUri } from "../../domains/mal/mal";
import { getWaifuImageOrGif } from "../../domains/waifu/waifu";

function createCommand() {
  const command = new SlashCommandBuilder()
    .setName("mallogin")
    .setDescription("Log into MAL account");

  return command;
}

async function execute(interaction: Interaction) {
  const actualInteraction = interaction as ActualInteraction;

  // Discord.js has a timeout of 3s, crawling is slow,
  // so we defer the response and edit it later
  await actualInteraction.deferReply();

  const state = { user: interaction.user.id, guild: interaction.guildId };

  const stateString = JSON.stringify(state);

  const oauth = getAskForUserPermissionsUri(stateString);

  const action = { href: oauth.oAuthUri, title: "Log into MAL!" };

  const background = await getWaifuImageOrGif("waifu");

  const description =
    "To access MAL capabilities, you have to grant Muu-chan permissions to read your list";

  const embed = createEmbed({ action, background, description });

  await actualInteraction.editReply({ embeds: [embed] });
}

export const command = { createCommand, execute };
