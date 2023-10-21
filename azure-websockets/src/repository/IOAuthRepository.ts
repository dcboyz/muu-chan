import { IOAuthKey, IOAuthRecord } from "./models/OAuthModel";

export interface IOAuthRepository {
  upsertOAuth(key: IOAuthKey, auth: Partial<IOAuthRecord>): Promise<void>;

  getOAuth(key: IOAuthKey): Promise<IOAuthRecord>;
}
