import { Interaction, SlashCommandBuilder } from "discord.js";

export type ActualInteraction = Interaction & {
  options: {
    getString(tag: string): string | undefined;
  };

  deferReply(): Promise<void>;

  editReply(body: any): Promise<void>;
};

export type SlashCommand = Omit<
  SlashCommandBuilder,
  "addSubcommandGroup" | "addSubcommand"
>;
