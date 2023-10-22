import { Inject, Service } from 'typedi'
import puppeteer, { ConnectOptions } from 'puppeteer'

import { IQuestion } from './IQuestion'
import { LeetcodeProviderOptions } from './LeetcodeProviderOptions'

@Service()
export class LeetcodeProvider {
  @Inject()
  private readonly optionsMonitor: LeetcodeProviderOptions

  public async getEasyOrMediumLeetcodeQuestions(tag: string) {
    const options = this.optionsMonitor.currentValue()

    const connectOptions: ConnectOptions = {
      browserWSEndpoint: `wss://chrome.browserless.io?token=${options.browserlessToken}`,
    }

    const browser = await puppeteer.connect(connectOptions)

    const page = await browser.newPage()

    const leetcodeUrl = `https://leetcode.com/tag/${tag}/`

    await page.goto(leetcodeUrl)

    const selector = '.title-cell__ZGos'

    const elementSelector = await page.waitForSelector(selector)

    const questions = await elementSelector?.evaluate(() => {
      const selector = '.title-cell__ZGos'

      let elements = document.querySelectorAll(selector)

      const links: IQuestion[] = []

      for (const element of elements) {
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
}
