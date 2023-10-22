import { Inject, Service } from 'typedi'
import { SlashCommandBuilder } from 'discord.js'

import { MyAnimeListLoginCommand } from './commands/MyAnimeListLogin'
import { MyAnimeListSuggestionCommand } from './commands/MyAnimeListSuggestion'
import { LeetcodeQuestionCommand } from './commands/LeetcodeQuestion'

import { ExecutorMap } from './ExecutorMap'

@Service()
export class CommandContainer {
  @Inject()
  private readonly myAnimeListLoginCommand: MyAnimeListLoginCommand

  @Inject()
  private readonly myAnimeListSuggestionCommand: MyAnimeListSuggestionCommand

  @Inject()
  private readonly leetcodeQuestionCommand: LeetcodeQuestionCommand

  private readonly commands: (SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>)[]

  private readonly executors: ExecutorMap

  constructor() {
    this.commands = []
    this.executors = {}
  }

  public getCommands() {
    if (this.commands.length == 0) {
      this.createContainer()
    }

    return this.commands
  }

  public getExecutorForCommand(name: string) {
    if (this.commands.length == 0) {
      this.createContainer()
    }

    return this.executors[name]
  }

  private createContainer() {
    const myAnimeListLoginSlashCommand = this.myAnimeListLoginCommand.createCommand()
    this.commands.push(myAnimeListLoginSlashCommand)
    this.executors[myAnimeListLoginSlashCommand.name] = this.myAnimeListLoginCommand

    const myAnimeListSuggestionSlashCommand = this.myAnimeListSuggestionCommand.createCommand()
    this.commands.push(myAnimeListSuggestionSlashCommand)
    this.executors[myAnimeListSuggestionSlashCommand.name] = this.myAnimeListSuggestionCommand

    const leetcodeQuestionSlashCommand = this.leetcodeQuestionCommand.createCommand()
    this.commands.push(leetcodeQuestionSlashCommand)
    this.executors[leetcodeQuestionSlashCommand.name] = this.leetcodeQuestionCommand
  }
}
