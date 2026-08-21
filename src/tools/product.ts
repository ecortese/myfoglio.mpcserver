import { z } from "zod";
import { apiClient } from "../client.js";
import type { ToolDefinition } from "../server.js";

export const productTools: ToolDefinition[] = [
  {
    name: "product_list",
    description: "Recupera la lista di tutti i prodotti",
    inputSchema: z.object({}),
    handler: async () => {
      const { data } = await apiClient.get("/Product");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
  {
    name: "product_create",
    description: "Crea un nuovo prodotto o servizio",
    inputSchema: z.object({
      Code: z.string().optional().describe("Codice identificativo del prodotto"),
      Description: z.string().describe("Descrizione del prodotto (obbligatoria)"),
      Units: z.string().optional().describe("Unità di misura (es. pz, kg, ore)"),
      VatRateCode: z.string().optional().describe("Codice aliquota IVA applicabile"),
      Currency: z.string().optional().describe("Valuta (es. EUR, USD)"),
      PricePerUnit: z.number().optional().describe("Prezzo unitario"),
      Notes: z.string().optional().describe("Note aggiuntive sul prodotto"),
    }),
    handler: async (input) => {
      const { data } = await apiClient.post("/Product", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
  {
    name: "product_update",
    description: "Aggiorna un prodotto esistente tramite ID",
    inputSchema: z.object({
      id: z.number().int().positive().describe("ID del prodotto da aggiornare"),
      Code: z.string().optional().describe("Codice identificativo del prodotto"),
      Description: z.string().optional().describe("Descrizione del prodotto"),
      Units: z.string().optional().describe("Unità di misura (es. pz, kg, ore)"),
      VatRateCode: z.string().optional().describe("Codice aliquota IVA applicabile"),
      Currency: z.string().optional().describe("Valuta (es. EUR, USD)"),
      PricePerUnit: z.number().optional().describe("Prezzo unitario"),
      Notes: z.string().optional().describe("Note aggiuntive sul prodotto"),
    }),
    handler: async (input) => {
      const { id, ...body } = input as { id: number } & Record<string, unknown>;
      const { data } = await apiClient.put("/Product", body, { params: { id } });
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
  {
    name: "product_delete",
    description: "Elimina un prodotto tramite ID",
    inputSchema: z.object({
      id: z.number().int().positive().describe("ID del prodotto da eliminare"),
    }),
    handler: async (input) => {
      const { id } = input as { id: number };
      const { data } = await apiClient.delete("/Product", { params: { id } });
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
];
