import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

import { connection } from "./common/azure-db";
import { getToken } from "./common/mal";

import { myAnimeListOAuthGrantedHTML } from "./templates/mal-oauth";

export async function malOAuthCallback(request: HttpRequest, _: InvocationContext): Promise<HttpResponseInit> {
  const code = request.query.get("code");
  const state = request.query.get("state");

  if (!code || !state) {
    throw new Error("Code or state missing");
  }

  const stateDeserialized: { user: string; guild: string } = JSON.parse(state);

  const { oauthVerifier } = await connection("MAL_OAUTH")
    .select({ oauthVerifier: "oauth_verifier" })
    .where({ user_id: stateDeserialized.user, guild_id: stateDeserialized.guild })
    .first();

  const token = await getToken(code, oauthVerifier);

  await connection("MAL_OAUTH").where({ guild_id: stateDeserialized.guild, user_id: stateDeserialized.user }).update({
    oauth_code: code,
    token: token.token,
    refresh_token: token.refreshToken,
    token_valid_until: token.tokenValidUntil,
    refresh_token_valid_until: token.refreshTokenValidUntil,
  });

  return { body: myAnimeListOAuthGrantedHTML, headers: { "content-type": "text/html" } };
}

app.http("malOAuthCallback", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: malOAuthCallback,
});
