import { Inject, Service } from 'typedi'

import { chooseRandom } from '../common/arrays'
import { createEmbed } from '../common/discord'

import { DiscordProvider } from '../discord/DiscordProvider'

import { LeetcodeProvider } from '../leetcode/LeetcodeProvider'

import { WaifuProvider } from '../waifu/WaifuProvider'

@Service()
export class LeetcodeCronHandler {
  @Inject()
  private readonly leetcodeProvider: LeetcodeProvider

  @Inject()
  private readonly waifuProvider: WaifuProvider

  @Inject()
  private readonly discordProvider: DiscordProvider

  getRandomLeetcodeQuestion = async () => {
    const tag = chooseRandom(LeetcodeProvider.tags)

    const questions = await this.leetcodeProvider.getEasyOrMediumLeetcodeQuestions(tag)

    const question = chooseRandom(questions!)

    const background = await this.waifuProvider.getRandomWaifuImageOrGifUri()

    const description = `Got question **${question.title}**!\n\nCategory: ${tag}`

    const embed = createEmbed({ title: question.title, link: question.href, backgroundUri: background, description })

    await this.discordProvider.broadcastInChannel(embed, 'leetcode')
  }
}
