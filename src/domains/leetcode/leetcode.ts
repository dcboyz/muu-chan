import puppeteer, { PuppeteerLaunchOptions } from "puppeteer";

export interface IQuestion {
  title: string;
  href: string;
}

export interface ILeetcodeOptions {
  tag: string;

  // Per-default, I'm not listening to this config in any way. I'm just excluding hard questions
  includeHards?: boolean;
}

export async function crawlLeetcodeForQuestions(options: ILeetcodeOptions) {
  const leetcodeUrl = `https://leetcode.com/tag/${options.tag}/`;

  // If you are running this directly from 'npm run ...' comment the executablePath line
  const browserOptions: PuppeteerLaunchOptions = {
    headless: "new",
    executablePath: "/usr/bin/chromium-browser",
    args: ["--no-sandbox"], // This is a giant security hole. Please do not deploy this code, this is intended to run on my local server ONLY!
  };

  const browser = await puppeteer.launch(browserOptions);

  const page = await browser.newPage();

  await page.goto(leetcodeUrl);

  const selector = ".title-cell__ZGos";

  const elementSelector = await page.waitForSelector(selector);

  const questions = await elementSelector?.evaluate(() => {
    const selector = ".title-cell__ZGos";

    let elements = document.querySelectorAll(selector);

    const links: IQuestion[] = [];

    for (const element of elements) {
      // I'm looking at the table row
      const tableRow = element.parentNode!.parentNode!;
      
      // The difficulty element is the only one in the row with class .round
      const difficultyContainer = tableRow.querySelector(".round");

      const difficulty = difficultyContainer?.textContent?.toLowerCase()

      // We don't want hard questions for now
      if ( difficulty == "hard") {
        continue;
      }

      const link = element.firstChild as HTMLLinkElement;

      links.push({ title: link.textContent!, href: link.href! });
    }

    return links;
  });

  await browser.close();

  return questions;
}
