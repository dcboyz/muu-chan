import puppeteer, { ConnectOptions } from 'puppeteer'

export interface IQuestion {
  title: string
  href: string
}

export interface ILeetcodeOptions {
  tag: string

  // Per-default, I'm not listening to this config in any way. I'm just excluding hard questions
  includeHards?: boolean
}

export async function crawlLeetcodeForQuestions(options: ILeetcodeOptions) {
  const browserlessToken = process.env.PUPPETEER_REMOTE_BROWSER_KEY as string

  const browserOptions: ConnectOptions = {
    browserWSEndpoint: `wss://chrome.browserless.io?token=${browserlessToken}`,
  }

  const browser = await puppeteer.connect(browserOptions)

  const page = await browser.newPage()

  const leetcodeUrl = `https://leetcode.com/tag/${options.tag}/`

  await page.goto(leetcodeUrl)

  const selector = '.title-cell__ZGos'

  const elementSelector = await page.waitForSelector(selector)

  const questions = await elementSelector?.evaluate(() => {
    const selector = '.title-cell__ZGos'

    let elements = document.querySelectorAll(selector)

    const links: IQuestion[] = []

    for (const element of elements) {
      // I'm looking at the table row
      const tableRow = element.parentNode!.parentNode!

      // The difficulty element is the only one in the row with class .round
      const difficultyContainer = tableRow.querySelector('.round')

      const difficulty = difficultyContainer?.textContent?.toLowerCase()

      // We don't want hard questions for now
      if (difficulty == 'hard') {
        continue
      }

      const link = element.firstChild as HTMLLinkElement

      links.push({ title: link.textContent!, href: link.href! })
    }

    return links
  })

  await browser.close()

  return questions
}
