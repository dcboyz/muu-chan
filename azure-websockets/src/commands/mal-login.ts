import { Interaction, SlashCommandBuilder } from "discord.js";

import { ActualInteraction } from "./common-types";

import { createEmbed } from "../common/discord";
import { getAskForUserPermissionsUri } from "../common/mal";
import { getWaifuImageOrGif } from "../common/waifu";
import { connection } from "../common/azure-db";

function createCommand() {
  const command = new SlashCommandBuilder().setName("mal-login").setDescription("Log into MAL account");

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

  try {
    await connection("MAL_OAUTH").insert({
      guild_id: state.guild,
      user_id: state.user,
      oauth_verifier: oauth.codeChallenge,
    });
  } catch (e) {
    console.error(e);

    await connection("MAL_OAUTH")
      .where({ guild_id: state.guild, user_id: state.user })
      .update({ oauth_verifier: oauth.codeChallenge });
  }

  const action = { href: oauth.oAuthUri, title: "Log into MAL!" };

  const background = await getWaifuImageOrGif("waifu");

  const description = "To access MAL capabilities, you have to grant Muu-chan permissions to read your list";

  const embed = createEmbed({ action, background, description });

  await actualInteraction.editReply({ embeds: [embed] });
}

export const command = { createCommand, execute };
