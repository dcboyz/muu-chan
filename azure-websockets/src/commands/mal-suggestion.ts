import { Interaction, SlashCommandBuilder } from "discord.js";

import { connection } from "../common/azure-db";
import { IToken, getSuggestions, refreshToken } from "../common/mal";

import { ActualInteraction } from "./common-types";
import { createEmbed } from "../common/discord";

function createCommand() {
  const command = new SlashCommandBuilder()
    .setName("mal-list-suggestion")
    .setDescription("Gets an anime suggestion based on the user's animelist");

  return command;
}

async function execute(interaction: Interaction) {
  const userId = interaction.user.id;
  const guildId = interaction.guildId;

  const actualInteraction = interaction as ActualInteraction;

  await actualInteraction.deferReply();

  let token: IToken = await connection("MAL_OAUTH")
    .select({
      token: "token",
      refreshToken: "refresh_token",
      tokenValidUntil: "token_valid_until",
      refreshTokenValidUntil: "refresh_token_valid_until",
    })
    .where({ user_id: userId, guild_id: guildId })
    .first();

  if (!token || !token.token || !token.refreshToken) {
    await actualInteraction.editReply("Your authentication expired. Please log in again to MAL using /mallogin");

    return;
  }

  const now = new Date();

  if (new Date(token.tokenValidUntil) < now) {
    if (new Date(token.refreshTokenValidUntil) < now) {
      await actualInteraction.editReply("Your authentication expired. Please log in again to MAL using /mallogin");

      return;
    }

    token = await refreshToken(token.refreshToken);

    await connection("MAL_OAUTH").where({ guild_id: guildId, user_id: userId }).update({
      token: token.token,
      refresh_token: token.refreshToken,
      token_valid_until: token.tokenValidUntil.getTime(),
      refresh_token_valid_until: token.refreshTokenValidUntil.getTime(),
    });
  }

  const suggestions = await getSuggestions(token.token);

  const embeds = suggestions.map((suggestion) =>
    createEmbed({
      action: { title: suggestion.title, href: `https://myanimelist.net/anime/${suggestion.id}` },
      background: suggestion.main_picture.large,
      description: `Muu-chan thinks that you'd like ${suggestion.title} `,
    })
  );

  await actualInteraction.editReply({ embeds });
}

export const command = { createCommand, execute };
