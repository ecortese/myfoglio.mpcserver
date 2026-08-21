import { z } from "zod";
import { apiClient } from "../client.js";
import type { ToolDefinition } from "../server.js";

export const validationTools: ToolDefinition[] = [
  {
    name: "validation_fiscal_code",
    description: "Valida un codice fiscale tramite il servizio di validazione",
    inputSchema: z.object({
      code: z.string().describe("Codice fiscale da validare"),
      country: z.string().describe("Codice paese (es. IT, DE, FR)"),
    }),
    handler: async (input) => {
      const { code, country } = input as { code: string; country: string };
      const { data } = await apiClient.get("/Validation/action/FiscalCode", {
        params: { code, country },
      });
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
  {
    name: "validation_vat_number",
    description: "Valida una partita IVA, con opzione per usare servizi esterni di verifica",
    inputSchema: z.object({
      code: z.string().describe("Partita IVA da validare"),
      country: z.string().describe("Codice paese (es. IT, DE, FR)"),
      useServices: z.boolean().optional().describe("Se true, usa servizi esterni (es. VIES) per la verifica"),
    }),
    handler: async (input) => {
      const { code, country, useServices } = input as {
        code: string;
        country: string;
        useServices?: boolean;
      };
      const { data } = await apiClient.get("/Validation/action/VatNumber", {
        params: { code, country, ...(useServices !== undefined && { useServices }) },
      });
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
];
