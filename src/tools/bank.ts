import { z } from "zod";
import { apiClient } from "../client.js";
import type { ToolDefinition } from "../server.js";

export const bankTools: ToolDefinition[] = [
  {
    name: "bank_get",
    description: "Recupera un conto bancario tramite ID",
    inputSchema: z.object({
      id: z.number().int().positive().describe("ID del conto bancario da recuperare"),
    }),
    handler: async (input) => {
      const { id } = input as { id: number };
      const { data } = await apiClient.get("/Bank", { params: { id } });
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
  {
    name: "bank_create",
    description: "Crea un nuovo conto bancario",
    inputSchema: z.object({
      Name: z.string().describe("Nome del conto bancario (obbligatorio)"),
      IBAN: z.string().optional().describe("Codice IBAN del conto"),
      Swift: z.string().optional().describe("Codice SWIFT/BIC della banca"),
      Holder: z.string().optional().describe("Intestatario del conto"),
      Currency: z.string().optional().describe("Valuta del conto (es. EUR, USD)"),
      IsDefault: z.boolean().optional().describe("Indica se è il conto predefinito"),
      Notes: z.string().optional().describe("Note aggiuntive sul conto"),
    }),
    handler: async (input) => {
      const { data } = await apiClient.post("/Bank", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
  {
    name: "bank_update",
    description: "Aggiorna un conto bancario esistente tramite ID",
    inputSchema: z.object({
      id: z.number().int().positive().describe("ID del conto bancario da aggiornare"),
      Name: z.string().optional().describe("Nome del conto bancario"),
      IBAN: z.string().optional().describe("Codice IBAN del conto"),
      Swift: z.string().optional().describe("Codice SWIFT/BIC della banca"),
      Holder: z.string().optional().describe("Intestatario del conto"),
      Currency: z.string().optional().describe("Valuta del conto (es. EUR, USD)"),
      IsDefault: z.boolean().optional().describe("Indica se è il conto predefinito"),
      Notes: z.string().optional().describe("Note aggiuntive sul conto"),
    }),
    handler: async (input) => {
      const { id, ...body } = input as { id: number } & Record<string, unknown>;
      const { data } = await apiClient.put("/Bank", body, { params: { id } });
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
  {
    name: "bank_delete",
    description: "Elimina un conto bancario tramite ID",
    inputSchema: z.object({
      id: z.number().int().positive().describe("ID del conto bancario da eliminare"),
    }),
    handler: async (input) => {
      const { id } = input as { id: number };
      const { data } = await apiClient.delete("/Bank", { params: { id } });
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
];
