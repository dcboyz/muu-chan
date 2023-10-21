import { IOAuthKey, IOAuthRecord } from './IOAuthModel'

export interface IOAuthRepository {
  upsertOAuth(key: IOAuthKey, auth: Partial<IOAuthRecord>): Promise<void>

  getOAuth(key: IOAuthKey): Promise<IOAuthRecord>
}
