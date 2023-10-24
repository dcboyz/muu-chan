import { Service } from 'typedi'

import { IOptionsMonitor } from '../configuration/IOptionsMonitor'

export interface IReactableRepositoryOptions {
  table: string
}

@Service()
export class ReactableRepositoryOptions implements IOptionsMonitor<IReactableRepositoryOptions> {
  public currentValue() {
    const table = process.env.REACTABLE_INTERACTIONS_TABLE as string

    const reactableRepositoryOptions: IReactableRepositoryOptions = {
      table,
    }

    return reactableRepositoryOptions
  }
}
