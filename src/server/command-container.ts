import { Interaction } from "discord.js";

import { SlashCommand } from "./commands/common-types.js";
import { command as quickLeetcodeQuestion } from "./commands/quick-leetcode-question.js";
import { command as malLogin } from "./commands/mal-login.js";

class CommandContainer {
  private readonly commands: SlashCommand[];

  private readonly executors: {
    [key: string]: (interaction: Interaction) => Promise<void>;
  };

  constructor() {
    this.commands = new Array();
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
    this.AddCommand(
      quickLeetcodeQuestion.createCommand,
      quickLeetcodeQuestion.execute,
    );

    this.AddCommand(
      malLogin.createCommand,
      malLogin.execute,
    );
  }

  private AddCommand(
    commandBuilder: () => SlashCommand,
    executor: (interaction: Interaction) => Promise<void>,
  ) {
    const command = commandBuilder();

    this.commands.push(command);

    this.executors[command.name] = executor;
  }
}

export const commandContainer = new CommandContainer();
