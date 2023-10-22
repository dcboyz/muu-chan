import { Inject, Service } from 'typedi'
import { Interaction, SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder } from 'discord.js'

import { createEmbed } from '../../common/discord'

import { LeetcodeProvider } from '../../leetcode/LeetcodeProvider'

import { WaifuProvider } from '../../waifu/WaifuProvider'

import { ICommand } from './ICommand'
import { IInteraction } from './IInteraction'
import { chooseRandom } from '../../common/arrays'

@Service()
export class LeetcodeQuestionCommand implements ICommand {
  @Inject()
  private readonly leetcodeProvider: LeetcodeProvider

  @Inject()
  private readonly waifuProvider: WaifuProvider

  private static readonly tags = [
    'array',
    'string',
    'hash-table',
    'sorting',
    'greedy',
    'depth-first-search',
    'binary-search',
    'breadth-first-search',
    'tree',
    'matrix',
    'two-pointers',
    'binary-tree',
    'heap-priority-queue',
    'stack',
    'prefix-sum',
    'graph',
    'backtracking',
    'sliding-window',
    'linked-list',
    'trie',
    'divide-and-conquer',
    'queue',
    'binary-search-tree',
    'quickselect',
    'bucket-sort',
  ]

  private static readonly tagChoices = LeetcodeQuestionCommand.tags.map((tag) => ({ name: tag, value: tag }))

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

  public async execute(interaction: Interaction): Promise<void> {
    const actualInteraction = interaction as IInteraction

    // Discord.js has a timeout of 3s, crawling is slow,
    // so we defer the response and edit it later
    await actualInteraction.deferReply()

    const tag = actualInteraction.options.getString('tag') ?? chooseRandom(LeetcodeQuestionCommand.tags)

    // We can start including hards later
    // const includeHards = interaction.options.GetBoolean('hards') ?? false
    const questions = await this.leetcodeProvider.getEasyOrMediumLeetcodeQuestions(tag)

    const question = chooseRandom(questions!)

    const background = await this.waifuProvider.getRandomWaifuImageOrGifUri()

    const description = `Got question **${question.title}**!\n\nCategory: ${tag}`

    const embed = createEmbed({ title: question.title, link: question.href, backgroundUri: background, description })

    await actualInteraction.editReply({ embeds: [embed] })
  }
}
