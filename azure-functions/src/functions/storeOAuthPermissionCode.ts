import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

import { connection } from "common/azure-db";

export async function storeOAuthPermissionCode(request: HttpRequest, _: InvocationContext): Promise<HttpResponseInit> {
  const code = request.query.get("code");
  const state = request.query.get("state");

  if (!code || !state) {
    throw new Error("Code or state missing");
  }

  const stateDeserialized: { user: string; guild: string } = JSON.parse(state);

  await connection("MAL_OAUTH")
    .where({
      guild_id: stateDeserialized.guild,
      user_id: stateDeserialized.user,
    })
    .update({ oauth_code: code });

  await connection.destroy();

  return { body: "Thanks for granting permissions to Muu-chan uwu" };
}

app.http("storeOAuthPermissionCode", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: storeOAuthPermissionCode,
});
