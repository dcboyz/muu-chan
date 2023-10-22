import { Inject, Service } from 'typedi'
import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandStringOption } from 'discord.js'

import { createEmbed } from '../../common/discord'
import { chooseRandom } from '../../common/arrays'

import { LeetcodeProvider } from '../../leetcode/LeetcodeProvider'

import { WaifuProvider } from '../../waifu/WaifuProvider'

import { ICommand } from './ICommand'

@Service()
export class LeetcodeQuestionCommand implements ICommand {
  @Inject()
  private readonly leetcodeProvider: LeetcodeProvider

  @Inject()
  private readonly waifuProvider: WaifuProvider

  private static readonly tagChoices = LeetcodeProvider.tags.map((tag) => ({ name: tag, value: tag }))

  public createCommand() {
    let tagCommandOption = new SlashCommandStringOption()

    tagCommandOption = tagCommandOption.addChoices(...LeetcodeQuestionCommand.tagChoices)
    tagCommandOption = tagCommandOption.setName('tag')
    tagCommandOption = tagCommandOption.setDescription('The main tag for the question')

    let command = new SlashCommandBuilder()
      .setName('leetcode-question')
      .setDescription('Fetch a quick question on a given tag')
      .addStringOption(tagCommandOption)

    return command
  }

  public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    // Discord.js has a timeout of 3s, crawling is slow,
    // so we defer the response and edit it later
    await interaction.deferReply()

    const tag = interaction.options.getString('tag')

    // We can start including hards later
    // const includeHards = interaction.options.GetBoolean('hards') ?? false
    const questions = await this.leetcodeProvider.getEasyOrMediumLeetcodeQuestions(
      tag ?? chooseRandom(LeetcodeProvider.tags),
    )

    const question = chooseRandom(questions!)

    const background = await this.waifuProvider.getRandomWaifuImageOrGifUri()

    const description = `Got question **${question.title}**!\n\nCategory: ${tag}`

    const embed = createEmbed({ title: question.title, link: question.href, backgroundUri: background, description })

    await interaction.editReply({ embeds: [embed] })
  }
}
