import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { config } from "dotenv";

// Cargar variables de entorno desde el archivo .env
config();

export const ai = genkit({
  plugins: [googleAI()],
  model: "googleai/gemini-2.0-flash",
});
