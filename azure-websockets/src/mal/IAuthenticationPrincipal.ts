export interface IAuthenticationPrincipal {
  token: string;
  refreshToken: string;
  tokenValidUntil: number;
  refreshTokenValidUntil: number;
}
