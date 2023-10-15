import express from "express";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../", "../", ".env") });

const PORT = 4000;

const server = express();

server.get("/oauth", (request, response) => {
  const { state, code } = request.query;

  console.log("Received state = " + state);
  console.log("Received code = " + code);

  response.status(200).send(
    "Thanks for authenticating on muu-chan. You can close this tab now.",
  );
});

server.listen(PORT);
