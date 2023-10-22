import { EmbedBuilder } from 'discord.js'

import { IMessage } from '../../discord/IMessage'

export function createEmbed(message: IMessage) {
  let embed = new EmbedBuilder()

  if (message.title) {
    embed = embed.setTitle(message.title)
  }

  if (message.link) {
    embed = embed.setURL(message.link)
  }

  if (message.backgroundUri) {
    embed = embed.setImage(message.backgroundUri)
  }

  if (message.description) {
    embed = embed.setDescription(message.description)
  }

  return embed
}
