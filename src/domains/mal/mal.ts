import { escape } from "querystring";

import { generateSafeToken } from "../../helpers/crypto";

const MAL_BASE_URL = "https://myanimelist.net/v1";
const RESPONSE_TYPE = "code";

export function getAskForUserPermissionsUri(state: string) {
  const clientId = process.env.MAL_CLIENT_ID as string;

  const codeChallenge = generateSafeToken();

  const redirectUri = escape("http://localhost:4000/oauth");

  const escapedState = escape(state);

  const oAuthUri =
    `${MAL_BASE_URL}/oauth2/authorize?response_type=${RESPONSE_TYPE}&client_id=${clientId}&code_challenge=${codeChallenge}&redirect_uri=${redirectUri}&state=${escapedState}`;

  return { oAuthUri, codeChallenge };
}
