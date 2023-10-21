export interface IOAuthModel {
  guild_id: string;
  user_id: string;
  oauth_code: string;
  oauth_verifier: string;
  token: string;
  refresh_token: string;
  token_valid_until: number;
  refresh_token_valid_until: number;
}

export type IOAuthKey = Pick<IOAuthModel, "user_id" | "guild_id">;
export type IOAuthRecord = Omit<IOAuthModel, "guild_id" | "user_id">;
