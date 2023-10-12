import cron from "node-cron";
import dotenv from "dotenv";

import path from "path";

import { broadcastLeetcodeQuestion } from "./commands/index.js";

// An extra '../' is needed because .env files are not copied to the distribution folder
dotenv.config({ path: path.resolve(__dirname, "../", "../", ".env") });

cron.schedule("30 17 * * *", broadcastLeetcodeQuestion);
