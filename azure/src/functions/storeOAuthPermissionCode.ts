import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

export async function storeOAuthPermissionCode(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const code = request.query.get("code");

  const state = request.query.get("state");

  return { body: "Thanks for granting permissions to Muu-chan uwu" };
}

app.http("storeOAuthPermissionCode", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: storeOAuthPermissionCode,
});
