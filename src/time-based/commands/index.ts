import { chooseRandom } from "./helpers.js";
import { crawlLeetcodeForQuestions } from "./leetcode.js";
import { getWaifuImageOrGif } from "./waifu.js";
import { broadcastDiscordMessage, createEmbed } from "./discord.js";

export async function broadcastLeetcodeQuestion() {
  const token: string = process.env.TOKEN as string;

  const tags: string = process.env.TAGS as string;

  const tag = chooseRandom(tags.split(","));

  const questions = await crawlLeetcodeForQuestions({ tag });

  const question = chooseRandom(questions!);

  const background = await getWaifuImageOrGif("bonk");

  const description =
    `Todays leetcode challenge is **${question.title}**!\n\nCategory: ${tag}`;

  const embed = createEmbed({ question, background, description });

  await broadcastDiscordMessage(token, embed);
}
