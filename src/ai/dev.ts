import { config } from "dotenv";
config();

import "@/ai/flows/weave-data-into-answers.ts";
import "@/ai/flows/generate-first-message.ts";
import "@/ai/flows/generate-chat-title.ts";
import "@/ai/tools/get-creator-info.ts";
