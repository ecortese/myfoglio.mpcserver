import { z } from "zod";
import { apiClient } from "../client.js";
import type { ToolDefinition } from "../server.js";

/** Schema riutilizzabile per il fornitore (venditore) del documento ricevuto */
const sellerSchema = z.object({
  ReferencedContactID: z.number().int().optional().describe("ID del contatto referenziato"),
  CompanyName: z.string().optional().describe("Ragione sociale del fornitore"),
  VatNumber: z.string().optional().describe("Partita IVA del fornitore"),
  FiscalCode: z.string().optional().describe("Codice fiscale del fornitore"),
}).optional().describe("Dati del fornitore/venditore (campo Seller per documenti ricevuti)");

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

/** Schema comune per la creazione/aggiornamento di una fattura ricevuta */
const documentBodySchema = z.object({
  Code: z.string().optional().describe("Numero/codice del documento"),
  SectionalID: z.number().int().optional().describe("ID del sezionale"),
  IssueDate: z.string().optional().describe("Data di emissione (ISO 8601)"),
  AccountingDate: z.string().optional().describe("Data di registrazione contabile (ISO 8601)"),
  Currency: z.string().optional().describe("Codice valuta (es. EUR)"),
  Seller: sellerSchema,
  Items: itemsSchema,
  DocumentNotes: z.string().optional().describe("Note sul documento"),
  Notes: z.string().optional().describe("Note aggiuntive"),
});

export const receivedInvoiceTools: ToolDefinition[] = [
  {
    name: "received_invoice_list",
    description: "Recupera la lista delle fatture ricevute dai fornitori",
    inputSchema: z.object({}),
    handler: async () => {
      const { data } = await apiClient.get("/ReceivedInvoice");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
  {
    name: "received_invoice_create",
    description: "Registra una nuova fattura ricevuta da un fornitore (usa il campo Seller)",
    inputSchema: documentBodySchema,
    handler: async (input) => {
      const { data } = await apiClient.post("/ReceivedInvoice", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
  {
    name: "received_invoice_update",
    description: "Aggiorna una fattura ricevuta esistente tramite ID",
    inputSchema: z.object({
      id: z.number().int().positive().describe("ID della fattura ricevuta da aggiornare"),
      ...documentBodySchema.shape,
    }),
    handler: async (input) => {
      const { id, ...body } = input as { id: number } & Record<string, unknown>;
      const { data } = await apiClient.put("/ReceivedInvoice", body, { params: { id } });
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
  {
    name: "received_invoice_delete",
    description: "Elimina una fattura ricevuta tramite ID",
    inputSchema: z.object({
      id: z.number().int().positive().describe("ID della fattura ricevuta da eliminare"),
    }),
    handler: async (input) => {
      const { id } = input as { id: number };
      const { data } = await apiClient.delete("/ReceivedInvoice", { params: { id } });
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
  {
    name: "received_invoice_next_code",
    description: "Ottieni il prossimo numero/codice disponibile per le fatture ricevute",
    inputSchema: z.object({
      SectionalID: z.number().int().optional().describe("ID del sezionale per cui calcolare il prossimo codice"),
    }),
    handler: async (input) => {
      const { data } = await apiClient.post("/ReceivedInvoice/action/NextCode", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
  {
    name: "received_invoice_calculate_totals",
    description: "Calcola i totali di una fattura ricevuta senza salvarla",
    inputSchema: documentBodySchema,
    handler: async (input) => {
      const { data } = await apiClient.post("/ReceivedInvoice/action/CalculateTotals", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
];
