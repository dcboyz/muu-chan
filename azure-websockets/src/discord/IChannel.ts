import { Channel, EmbedBuilder } from 'discord.js'

export type IChannel = Channel & {
  name: string
  send(message: { embeds: EmbedBuilder[] }): Promise<void>
}
