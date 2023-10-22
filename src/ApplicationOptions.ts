import { Service } from 'typedi'
import { IOptionsMonitor } from './configuration/IOptionsMonitor'

interface IApplicationOptions {
  httpPort: number
}

@Service()
export class ApplicationOptions implements IOptionsMonitor<IApplicationOptions> {
  public currentValue() {
    const httpPort = process.env.PORT as string

    const applicationOptions: IApplicationOptions = {
      httpPort: parseInt(httpPort),
    }

    return applicationOptions
  }
}
