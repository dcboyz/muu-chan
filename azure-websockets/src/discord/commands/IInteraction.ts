import { Interaction } from 'discord.js'

export type IInteraction = Interaction & {
  options: {
    getString(tag: string): string | undefined
  }

  deferReply(): Promise<void>

  editReply(body: any): Promise<void>
}
