import { EmbedBuilder } from "discord.js";

import { IQuestion } from "../domains/leetcode/leetcode.js";

export interface IMessage {
  action: IQuestion;
  background: string;
  description: string;
}

export function createEmbed(message: IMessage) {
  const { action: question, background, description } = message;

  return new EmbedBuilder()
    .setURL(question.href)
    .setTitle(question.title)
    .setImage(background)
    .setDescription(description);
}
