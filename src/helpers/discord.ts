import { EmbedBuilder } from "discord.js";

import { IQuestion } from "../domains/leetcode/leetcode.js";

export interface IMessage {
  question: IQuestion;
  background: string;
  description: string;
}

export function createEmbed(message: IMessage) {
  const { question, background, description } = message;

  return new EmbedBuilder()
    .setURL(question.href)
    .setTitle(question.title)
    .setImage(background)
    .setDescription(description);
}
