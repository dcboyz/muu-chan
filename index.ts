import { config } from "dotenv";

import {
  Channel,
  Client,
  ClientOptions,
  EmbedBuilder,
  GatewayIntentBits,
} from "discord.js";

import puppeteer from "puppeteer";

type ActualClientOptions = ClientOptions & {
  restRequestTimeout: number;
};

type ActualChannel = Channel & {
  name: string;
  send(message: { embeds: EmbedBuilder[] }): void;
};

config({ path: "/home/eferrari/code/projects/simple-muu/.env" });

export async function runDailyLeetCodeCrawl() {
  const tags: string[] = (process.env.TAGS as string).split(",");

  const chosenTag = tags[Math.floor(Math.random() * tags.length)];

  const leetcodeUrl = `https://leetcode.com/tag/${chosenTag}/`;

  const browser = await puppeteer.launch({ headless: "new" });

  const page = await browser.newPage();

  await page.goto(leetcodeUrl);

  const selector = ".title-cell__ZGos";

  const elementSelector = await page.waitForSelector(selector);

  const questions = await elementSelector?.evaluate(() => {
    const selector = ".title-cell__ZGos";

    let elements = document.querySelectorAll(selector);

    const links: { title: string; href: string }[] = [];

    for (const element of elements) {
      const link = element.firstChild as HTMLLinkElement;

      links.push({ title: link.textContent!, href: link.href! });
    }

    return links;
  });

  const chosenQuestion =
    questions![Math.floor(Math.random() * questions!.length)];

  const response = await fetch("https://api.waifu.pics/sfw/bonk");

  const { url } = await response.json();

  const embed = new EmbedBuilder()
    .setURL(
      chosenQuestion.href,
    )
    .setTitle(chosenQuestion.title)
    .setImage(url)
    .setDescription(
      `Todays leetcode challenge is **'${chosenQuestion.title}'**!\n\nCategory: ${chosenTag}`,
    );

  const token: string = process.env.TOKEN as string;

  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    closeTimeout: 200_000,
    rest: { timeout: 200_000 },
    restRequestTimeout: 200_000,
  } as ActualClientOptions);

  await client.login(token);

  const servers = await client.guilds.fetch();

  const idAndChannels = servers
    .mapValues((server) => server.client.channels.cache)
    .mapValues((cache) =>
      cache.filter((channel) => {
        const actualChannel = channel as ActualChannel;

        return actualChannel.isTextBased() && actualChannel.name == "leetcode";
      })
    );

  const channel_seen: { [key: string]: boolean } = {};

  for (const [_, channels] of idAndChannels) {
    for (const [__, channel] of channels) {
      if (channel.id in channel_seen) {
        continue;
      }

      const actualChannel = channel as ActualChannel;
      actualChannel.send({ embeds: [embed] });

      channel_seen[actualChannel.id] = true;
    }
  }

  await client.destroy();
  await browser.close();
}

await runDailyLeetCodeCrawl();
