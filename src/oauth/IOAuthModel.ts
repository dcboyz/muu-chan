import { ICosmosItem } from '../database/ICosmosItem'

export interface IOAuthModel extends ICosmosItem {
  id: string
  oauthCode: string
  oauthVerifier: string
  token: string
  refreshToken: string
  tokenValidUntil: number
  refreshTokenValidUntil: number
}

export type IOAuthKey = Pick<IOAuthModel, 'id' | 'partitionKey'>
export type IOAuthRecord = Omit<IOAuthModel, 'id' | 'partitionKey'>
