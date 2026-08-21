import { z } from "zod";
import { apiClient } from "../client.js";
import type { ToolDefinition } from "../server.js";

export const searchTools: ToolDefinition[] = [
  {
    name: "search",
    description: "Esegue una ricerca full-text globale su tutti i dati dell'account",
    inputSchema: z.object({
      q: z.string().describe("Testo da cercare"),
    }),
    handler: async (input) => {
      const { q } = input as { q: string };
      const { data } = await apiClient.get("/Search", { params: { q } });
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
];
