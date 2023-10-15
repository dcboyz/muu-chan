import express from "express";
import dotenv from "dotenv";

dotenv.config();

import { connection } from "common/azure-db";

const server = express();

server.get("/mal-oauth", async (request, response) => {
  const code = request.query.code as string;
  const state = request.query.state as string;

  if (!code || !state) {
    throw new Error("Code or state missing");
  }

  const stateDeserialized: { user: string; guild: string } = JSON.parse(state);

  await connection("MAL_OAUTH")
    .where({ guild_id: stateDeserialized.guild, user_id: stateDeserialized.user })
    .update({ oauth_code: code });

  response.send("Thanks for granting permissions to Muu-chan uwu");
});

server.listen(process.env.PORT);
