import { z } from "zod";
import { apiClient } from "../client.js";
import type { ToolDefinition } from "../server.js";

/** Schema riutilizzabile per l'intestatario (acquirente) del documento */
const buyerSchema = z.object({
  ReferencedContactID: z.number().int().optional().describe("ID del contatto referenziato"),
  CompanyName: z.string().optional().describe("Ragione sociale"),
  VatNumber: z.string().optional().describe("Partita IVA"),
  FiscalCode: z.string().optional().describe("Codice fiscale"),
}).optional().describe("Dati dell'acquirente/destinatario");

/** Schema riutilizzabile per le righe del documento */
const itemsSchema = z.array(
  z.object({
    Description: z.string().describe("Descrizione della riga"),
    Quantity: z.number().optional().describe("Quantità"),
    PricePerUnit: z.number().optional().describe("Prezzo unitario"),
    VatRateCode: z.string().optional().describe("Codice aliquota IVA"),
    Units: z.string().optional().describe("Unità di misura"),
  })
).optional().describe("Righe del documento");

/** Schema comune per la creazione/aggiornamento di un DDT */
const documentBodySchema = z.object({
  Code: z.string().optional().describe("Numero/codice del documento"),
  SectionalID: z.number().int().optional().describe("ID del sezionale"),
  IssueDate: z.string().optional().describe("Data di emissione (ISO 8601)"),
  AccountingDate: z.string().optional().describe("Data di registrazione contabile (ISO 8601)"),
  Currency: z.string().optional().describe("Codice valuta (es. EUR)"),
  Buyer: buyerSchema,
  Items: itemsSchema,
  DocumentNotes: z.string().optional().describe("Note sul documento"),
  Notes: z.string().optional().describe("Note aggiuntive"),
});

export const deliveryNoteTools: ToolDefinition[] = [
  {
    name: "delivery_note_list",
    description: "Recupera la lista dei documenti di trasporto (DDT)",
    inputSchema: z.object({}),
    handler: async () => {
      const { data } = await apiClient.get("/DeliveryNote");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
  {
    name: "delivery_note_create",
    description: "Crea un nuovo documento di trasporto (DDT)",
    inputSchema: documentBodySchema,
    handler: async (input) => {
      const { data } = await apiClient.post("/DeliveryNote", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
  {
    name: "delivery_note_update",
    description: "Aggiorna un documento di trasporto (DDT) esistente tramite ID",
    inputSchema: z.object({
      id: z.number().int().positive().describe("ID del documento di trasporto da aggiornare"),
      ...documentBodySchema.shape,
    }),
    handler: async (input) => {
      const { id, ...body } = input as { id: number } & Record<string, unknown>;
      const { data } = await apiClient.put("/DeliveryNote", body, { params: { id } });
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
  {
    name: "delivery_note_delete",
    description: "Elimina un documento di trasporto (DDT) tramite ID",
    inputSchema: z.object({
      id: z.number().int().positive().describe("ID del documento di trasporto da eliminare"),
    }),
    handler: async (input) => {
      const { id } = input as { id: number };
      const { data } = await apiClient.delete("/DeliveryNote", { params: { id } });
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
  {
    name: "delivery_note_next_code",
    description: "Ottieni il prossimo numero/codice disponibile per i documenti di trasporto",
    inputSchema: z.object({
      SectionalID: z.number().int().optional().describe("ID del sezionale per cui calcolare il prossimo codice"),
    }),
    handler: async (input) => {
      const { data } = await apiClient.post("/DeliveryNote/action/NextCode", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
  {
    name: "delivery_note_calculate_totals",
    description: "Calcola i totali di un documento di trasporto senza salvarlo",
    inputSchema: documentBodySchema,
    handler: async (input) => {
      const { data } = await apiClient.post("/DeliveryNote/action/CalculateTotals", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
];
