import { Interaction } from "discord.js";

import { SlashCommand } from "./common-types.js";
import { command as quickLeetcodeQuestion } from "./leetcode-question.js";
import { command as malLogin } from "./mal-login.js";

type Executor = (interaction: Interaction) => Promise<void>;
type ExecutorMap = { [key: string]: Executor };

class CommandContainer {
  private readonly commands: SlashCommand[];
  private readonly executors: ExecutorMap;

  constructor() {
    this.commands = [];
    this.executors = {};
  }

  public getCommands() {
    if (this.commands.length == 0) {
      this.createContainer();
    }

    return this.commands;
  }

  public getExecutorForCommand(name: string) {
    if (this.commands.length == 0) {
      this.createContainer();
    }

    return this.executors[name];
  }

  private createContainer() {
    this.AddCommand(quickLeetcodeQuestion.createCommand, quickLeetcodeQuestion.execute);
    this.AddCommand(malLogin.createCommand, malLogin.execute);
  }

  private AddCommand(commandBuilder: () => SlashCommand, executor: Executor) {
    const command = commandBuilder();

    this.commands.push(command);

    this.executors[command.name] = executor;
  }
}

export const commandContainer = new CommandContainer();
