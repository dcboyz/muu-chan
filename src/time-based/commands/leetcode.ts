import puppeteer from "puppeteer";

export enum LeetcodeDifficulty {
  ANY = 0,
  EASY = 1,
  MEDIUM = 2,
  HARD = 4,
}

export interface IQuestion {
  title: string;
  href: string;
}

export interface ILeetcodeOptions {
  tag: string;
  difficulty?: number;
}

export async function crawlLeetcodeForQuestions(options: ILeetcodeOptions) {
  const leetcodeUrl = `https://leetcode.com/tag/${options.tag}/`;

  const browser = await puppeteer.launch({ headless: "new" });

  const page = await browser.newPage();

  await page.goto(leetcodeUrl);

  const selector = ".title-cell__ZGos";

  const elementSelector = await page.waitForSelector(selector);

  const questions = await elementSelector?.evaluate(() => {
    const selector = ".title-cell__ZGos";

    let elements = document.querySelectorAll(selector);

    const links: IQuestion[] = [];

    for (const element of elements) {
      const link = element.firstChild as HTMLLinkElement;

      links.push({ title: link.textContent!, href: link.href! });
    }

    return links;
  });

  await browser.close();

  return questions;
}
