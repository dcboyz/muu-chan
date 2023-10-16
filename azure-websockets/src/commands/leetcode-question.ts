import { Interaction, SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

import { chooseRandom } from "../common/arrays";
import { createEmbed } from "../common/discord";
import { crawlLeetcodeForQuestions } from "../common/leetcode";
import { getWaifuImageOrGif } from "../common/waifu";

import { ActualInteraction } from "./common-types.js";

function createCommand() {
  const tagString = process.env.LEETCODE_RELEVANT_TAGS as string;
  const tags = tagString.split(",");

  const tagOptionsChoices = tags.map((tag) => ({ name: tag, value: tag }));

  const commandOptions = new SlashCommandStringOption()
    .addChoices(...tagOptionsChoices)
    .setName("tag")
    .setDescription("The main tag of the question to choose");

  const difficultyOptions = new SlashCommandBooleanOption()
    .setName("hards")
    .setDescription("Whether or not to include hard questions in the generation. Ignored for now.");

  const command = new SlashCommandBuilder()
    .setName("leetcode-question")
    .setDescription("Get an easy/medium problem from Leetcode on a selected or random tag")
    .addStringOption(commandOptions)
    .addBooleanOption(difficultyOptions);

  return command;
}

async function execute(interaction: Interaction) {
  const tagString = process.env.LEETCODE_RELEVANT_TAGS as string;
  const tags = tagString.split(",");

  const actualInteraction = interaction as ActualInteraction;

  // Discord.js has a timeout of 3s, crawling is slow,
  // so we defer the response and edit it later
  await actualInteraction.deferReply();

  const tag = actualInteraction.options.getString("tag") ?? chooseRandom(tags);

  // We can start including hards later
  // const includeHards = interaction.options.GetBoolean('hards') ?? false
  const questions = await crawlLeetcodeForQuestions({ tag: tag });

  const question = chooseRandom(questions!);

  const background = await getWaifuImageOrGif("pat");

  const description = `Got question **${question.title}**!\n\nCategory: ${tag}`;

  const embed = createEmbed({ action: question, background, description });

  await actualInteraction.editReply({ embeds: [embed] });
}

export const command = { createCommand, execute };
