import { z } from "zod";
import { apiClient } from "../client.js";
import type { ToolDefinition } from "../server.js";

// Schema Zod riutilizzabile per il buyer (cliente/destinatario del documento)
const BuyerSchema = z.object({
  ReferencedContactID: z.number().int().positive().optional().describe("ID del contatto già presente in rubrica"),
  CompanyName: z.string().optional().describe("Ragione sociale del cliente"),
  VatNumber: z.string().optional().describe("Partita IVA del cliente"),
  FiscalCode: z.string().optional().describe("Codice fiscale del cliente"),
});

// Schema Zod riutilizzabile per una riga del documento
const ItemSchema = z.object({
  Description: z.string().describe("Descrizione della riga"),
  Quantity: z.number().optional().describe("Quantità"),
  PricePerUnit: z.number().optional().describe("Prezzo unitario"),
  VatRateCode: z.string().optional().describe("Codice aliquota IVA (es. '22')"),
  Units: z.string().optional().describe("Unità di misura (es. 'pz', 'ore')"),
});

// Schema Zod completo per il body di un documento (fattura, nota di credito, preventivo, ricevuta)
export const DocumentInputSchema = z.object({
  Code: z.string().optional().describe("Numero documento"),
  SectionalID: z.number().int().positive().optional().describe("ID del sezionale"),
  IssueDate: z.string().optional().describe("Data di emissione (formato ISO 8601)"),
  AccountingDate: z.string().optional().describe("Data contabile (formato ISO 8601)"),
  Currency: z.string().optional().describe("Codice valuta (es. 'EUR')"),
  Buyer: BuyerSchema.optional().describe("Dati del cliente destinatario"),
  Items: z.array(ItemSchema).optional().describe("Righe del documento"),
  DocumentNotes: z.string().optional().describe("Note sul documento"),
  Notes: z.string().optional().describe("Note interne"),
  SendToBuyer: z.boolean().optional().describe("Se true, invia il documento al cliente"),
});

export type DocumentInput = z.infer<typeof DocumentInputSchema>;

/**
 * Genera i 7 tool MCP standard per un tipo di documento (fattura, nota di credito, ecc.).
 *
 * @param docType  - Nome del tipo documento come da API (es. "Invoice", "CreditNote")
 * @param prefix   - Prefisso snake_case per i nomi dei tool (es. "invoice", "credit_note")
 * @param docLabel - Etichetta leggibile in italiano per le descrizioni (es. "fattura", "nota di credito")
 */
export function buildDocumentTools(
  docType: string,
  prefix: string,
  docLabel: string
): ToolDefinition[] {
  const endpoint = `/${docType}`;

  return [
    // ── 1. Lista ────────────────────────────────────────────────────────────
    {
      name: `${prefix}_list`,
      description: `Recupera la lista dei documenti di tipo ${docLabel}`,
      inputSchema: z.object({}),
      handler: async () => {
        try {
          const { data } = await apiClient.get(endpoint);
          return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err: unknown) {
          throw new Error(`Errore nel recupero della lista ${docLabel}: ${String(err)}`);
        }
      },
    },

    // ── 2. Creazione ─────────────────────────────────────────────────────────
    {
      name: `${prefix}_create`,
      description: `Crea un nuovo documento di tipo ${docLabel}`,
      inputSchema: DocumentInputSchema,
      handler: async (input) => {
        try {
          const { data } = await apiClient.post(endpoint, input);
          return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err: unknown) {
          throw new Error(`Errore nella creazione del documento ${docLabel}: ${String(err)}`);
        }
      },
    },

    // ── 3. Aggiornamento ──────────────────────────────────────────────────────
    {
      name: `${prefix}_update`,
      description: `Aggiorna un documento ${docLabel} esistente tramite ID`,
      inputSchema: DocumentInputSchema.extend({
        id: z.number().int().positive().describe(`ID del documento ${docLabel} da aggiornare`),
      }),
      handler: async (input) => {
        try {
          const { id, ...body } = input as { id: number } & Record<string, unknown>;
          const { data } = await apiClient.put(endpoint, body, { params: { id } });
          return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err: unknown) {
          throw new Error(`Errore nell'aggiornamento del documento ${docLabel}: ${String(err)}`);
        }
      },
    },

    // ── 4. Eliminazione ───────────────────────────────────────────────────────
    {
      name: `${prefix}_delete`,
      description: `Elimina un documento ${docLabel} tramite ID`,
      inputSchema: z.object({
        id: z.number().int().positive().describe(`ID del documento ${docLabel} da eliminare`),
      }),
      handler: async (input) => {
        try {
          const { id } = input as { id: number };
          const { data } = await apiClient.delete(endpoint, { params: { id } });
          return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err: unknown) {
          throw new Error(`Errore nell'eliminazione del documento ${docLabel}: ${String(err)}`);
        }
      },
    },

    // ── 5. Prossimo numero documento ─────────────────────────────────────────
    {
      name: `${prefix}_next_code`,
      description: `Ottieni il prossimo numero disponibile per un documento ${docLabel}`,
      inputSchema: z.object({
        SectionalID: z.number().int().positive().optional().describe("ID del sezionale (opzionale)"),
      }),
      handler: async (input) => {
        try {
          const { data } = await apiClient.post(`${endpoint}/action/NextCode`, input);
          return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err: unknown) {
          throw new Error(`Errore nel recupero del prossimo numero ${docLabel}: ${String(err)}`);
        }
      },
    },

    // ── 6. Trasmissione (SDI/elettronico) ────────────────────────────────────
    {
      name: `${prefix}_transmit`,
      description: `Trasmette un documento ${docLabel} al Sistema di Interscambio (SDI) o per la fatturazione elettronica`,
      inputSchema: z.object({
        id: z.number().int().positive().describe(`ID del documento ${docLabel} da trasmettere`),
      }),
      handler: async (input) => {
        try {
          const { id } = input as { id: number };
          const { data } = await apiClient.post(`${endpoint}/action/Transmit`, undefined, {
            params: { id },
          });
          return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err: unknown) {
          throw new Error(`Errore nella trasmissione del documento ${docLabel}: ${String(err)}`);
        }
      },
    },

    // ── 7. Calcolo totali (senza salvataggio) ────────────────────────────────
    {
      name: `${prefix}_calculate_totals`,
      description: `Calcola i totali di un documento ${docLabel} senza salvarlo`,
      inputSchema: DocumentInputSchema,
      handler: async (input) => {
        try {
          const { data } = await apiClient.post(`${endpoint}/action/CalculateTotals`, input);
          return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err: unknown) {
          throw new Error(`Errore nel calcolo dei totali ${docLabel}: ${String(err)}`);
        }
      },
    },
  ];
}
