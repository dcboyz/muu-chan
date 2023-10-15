import { app, InvocationContext, Timer } from "@azure/functions";
import { config as configEnvironment } from "dotenv";

configEnvironment();

import { chooseRandom } from "common/arrays";
import { crawlLeetcodeForQuestions } from "common/leetcode";
import { getWaifuImageOrGif } from "common/waifu";
import { createEmbed, broadcastDiscordMessage } from "common/discord";

export async function broadcastLeetcodeQuestion(_: Timer, __: InvocationContext): Promise<void> {
  const token: string = process.env.DISCORD_BOT_TOKEN as string;
  const tags: string = process.env.LEETCODE_RELEVANT_TAGS as string;

  const tag = chooseRandom(tags.split(","));

  const questions = await crawlLeetcodeForQuestions({ tag });

  const question = chooseRandom(questions!);

  const background = await getWaifuImageOrGif("bonk");

  const description = `Todays leetcode challenge is **${question.title}**!\n\nCategory: ${tag}`;

  const embed = createEmbed({ action: question, background, description });

  await broadcastDiscordMessage(token, embed);
}

app.timer("broadcastLeetcodeQuestion", {
  schedule: "30 17 * * * *",
  handler: broadcastLeetcodeQuestion,
});
