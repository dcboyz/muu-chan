import { Service } from 'typedi'

import { IOptionsMonitor } from '../configuration/IOptionsMonitor'

export interface ILeetcodeProviderOptions {
  browserlessToken: string
}

@Service()
export class LeetcodeProviderOptions implements IOptionsMonitor<ILeetcodeProviderOptions> {
  public currentValue() {
    const browserlessToken = process.env.PUPPETEER_REMOTE_BROWSER_KEY as string

    const options: ILeetcodeProviderOptions = { browserlessToken }

    return options
  }
}
