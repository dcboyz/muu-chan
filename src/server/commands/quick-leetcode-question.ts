import {
  APIApplicationCommandOptionChoice,
  Interaction,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";

import { chooseRandom } from "../../helpers/arrays.js";
import { createEmbed } from "../../helpers/discord.js";

import { crawlLeetcodeForQuestions } from "../../domains/leetcode/leetcode.js";
import { getWaifuImageOrGif } from "../../domains/waifu/waifu.js";

type ActualInteraction = Interaction & {
  options: {
    getString(tag: string): string | undefined;
  };

  deferReply(): Promise<void>;

  editReply(body: any): Promise<void>;
};

function createCommand() {
  const tagString = process.env.TAGS as string;
  const tags = tagString.split(",");

  const tagOptionsChoices = tags.map((tag) => ({ name: tag, value: tag }));

  const commandOptions = new SlashCommandStringOption()
    .addChoices(...tagOptionsChoices)
    .setName("tag")
    .setDescription("The main tag of the question to choose");

  const difficultyOptions = new SlashCommandBooleanOption()
    .setName("hards")
    .setDescription(
      "Whether or not to include hard questions in the generation. Ignored for now.",
    );

  const command = new SlashCommandBuilder()
    .setName("quickleetcode")
    .setDescription("Get an easy/medium problem from Leetcode on a selected or random tag")
    .addStringOption(commandOptions)
    .addBooleanOption(difficultyOptions);

  return command;
}

async function execute(interaction: Interaction) {
  const tagString = process.env.TAGS as string;
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

  const embed = createEmbed({ question, background, description });

  await actualInteraction.editReply({ embeds: [embed] });
}

export const command = { createCommand, execute };
