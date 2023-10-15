import { Channel, Client, Collection, EmbedBuilder, GatewayIntentBits, OAuth2Guild } from "discord.js";

import { IQuestion } from "../leetcode";

export interface IMessage {
  action: IQuestion;
  background: string;
  description: string;
}

export type ActualChannel = Channel & {
  name: string;
  send(message: { embeds: EmbedBuilder[] }): void;
};

export function createEmbed(message: IMessage) {
  const { action: question, background, description } = message;

  return new EmbedBuilder()
    .setURL(question.href)
    .setTitle(question.title)
    .setImage(background)
    .setDescription(description);
}

export function* getChannels(guilds: Collection<string, OAuth2Guild>, name: string) {
  const seen = new Set();

  for (const [_, guild] of guilds) {
    const channels = guild.client.channels.cache;

    for (const [channelId, channel] of channels) {
      if (seen.has(channelId)) continue;

      const actualChannel = channel as ActualChannel;

      if (actualChannel.isTextBased() && actualChannel.name == name) {
        yield actualChannel;
      }

      seen.add(channelId);
    }
  }
}

export async function broadcastDiscordMessage(token: string, message: EmbedBuilder) {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  await client.login(token);

  const guilds = await client.guilds.fetch();

  for (const leetcodeChannel of getChannels(guilds, "leetcode")) {
    await leetcodeChannel.send({ embeds: [message] });
  }

  await client.destroy();
}
