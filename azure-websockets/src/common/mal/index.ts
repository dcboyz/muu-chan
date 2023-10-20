import { escape } from "querystring";

import { generateSafeToken } from "../crypto";

const MAL_BASE_URL = "https://myanimelist.net/v1";
const RESPONSE_TYPE = "code";

interface ITokenResponse {
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

export interface IToken {
  token: string;
  refreshToken: string;
  tokenValidUntil: Date;
  refreshTokenValidUntil: Date;
}

export function getAskForUserPermissionsUri(state: string) {
  const redirect_uri = process.env.AZURE_MAL_OAUTH_URL as string;
  const clientId = process.env.MAL_CLIENT_ID as string;

  const codeChallenge = generateSafeToken();

  const redirectUri = escape(redirect_uri);

  const escapedState = escape(state);

  const oAuthUri = `${MAL_BASE_URL}/oauth2/authorize?response_type=${RESPONSE_TYPE}&client_id=${clientId}&code_challenge=${codeChallenge}&redirect_uri=${redirectUri}&state=${escapedState}`;

  return { oAuthUri, codeChallenge };
}

export async function getToken(code: string, verifier: string): Promise<IToken> {
  const clientId = process.env.MAL_CLIENT_ID as string;
  const clientSecret = process.env.MAL_CLIENT_SECRET as string;
  const redirect_uri = process.env.AZURE_MAL_OAUTH_URL as string;

  const tokenRequestBody = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code: code,
    code_verifier: verifier,
    grant_type: "authorization_code",
    redirect_uri: redirect_uri, // dummy endpoint
  });

  const tokenUri = `${MAL_BASE_URL}/oauth2/token`;

  const response = await fetch(tokenUri, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: tokenRequestBody,
  });

  const tokenResponseBody: ITokenResponse = await response.json();

  const now = new Date().getTime();

  // ExpiresIn comes in a second format, while Node expects milliseconds
  const tokenValidUntil = new Date(now + tokenResponseBody.expires_in * 1000);

  // The refresh token is valid for 31 days
  const refreshTokenValidUntil = new Date(now + 31 * 86400);

  return {
    token: tokenResponseBody.access_token,
    refreshToken: tokenResponseBody.refresh_token,
    tokenValidUntil,
    refreshTokenValidUntil,
  };
}

export async function refreshToken(refreshToken: string): Promise<IToken> {
  const clientId = process.env.MAL_CLIENT_ID as string;
  const clientSecret = process.env.MAL_CLIENT_SECRET as string;
  const redirect_uri = process.env.AZURE_MAL_OAUTH_URL as string;

  const tokenRequestBody = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    redirect_uri: redirect_uri, // dummy endpoint
  });

  const tokenUri = `${MAL_BASE_URL}/oauth2/token`;

  const response = await fetch(tokenUri, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: tokenRequestBody,
  });

  const tokenResponseBody: ITokenResponse = await response.json();

  const now = new Date().getTime();

  // ExpiresIn comes in a second format, while Node expects milliseconds
  const tokenValidUntil = new Date(now + tokenResponseBody.expires_in * 1000);

  // The refresh token is valid for 31 days
  const refreshTokenValidUntil = new Date(now + 31 * 86400);

  return {
    token: tokenResponseBody.access_token,
    refreshToken: tokenResponseBody.refresh_token,
    tokenValidUntil,
    refreshTokenValidUntil,
  };
}

interface ISuggestionResponse {
  data: ISuggestion[];
}

interface ISuggestion {
  node: Anime;
}

interface Anime {
  id: number;
  title: string;
  main_picture: MainPicture;
}

interface MainPicture {
  medium: string;
  large: string;
}

export async function getSuggestions(token: string) {
  const suggestionsUri = "https://api.myanimelist.net/v2/anime/suggestions?limit=3";

  const response = await fetch(suggestionsUri, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { data }: ISuggestionResponse = await response.json();

  return data.map((suggestion) => suggestion.node);
}
