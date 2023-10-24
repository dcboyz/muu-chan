import { ICosmosItem } from '../database/ICosmosItem'

export interface IReactableModel extends ICosmosItem {
  id: string
  caller: string
  metadata: string
}

export type IReactableKey = Pick<IReactableModel, 'id' | 'partitionKey'>
export type IReactableRecord = Omit<IReactableModel, 'id' | 'partitionKey'>
