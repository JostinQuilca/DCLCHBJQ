"use server";

import { ai } from "@/ai/genkit";
import { z } from "zod";

export const getCreatorInfoTool = ai.defineTool(
  {
    name: "getCreatorInfoTool",
    description:
      "Use this tool to get information about who created the chatbot.",
    inputSchema: z.object({}), // No input needed
    outputSchema: z.string(),
  },
  async () => {
    return "Fui creado por Jostin Quilca como parte de un examen para la materia de Cloud Computing.";
  }
);
