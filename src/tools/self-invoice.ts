import { z } from "zod";
import { apiClient } from "../client.js";
import type { ToolDefinition } from "../server.js";

// Schema Zod per il cedente/prestatore (Seller) dell'autofattura
const SellerSchema = z.object({
  ReferencedContactID: z.number().int().positive().optional().describe("ID del contatto già presente in rubrica"),
  CompanyName: z.string().optional().describe("Ragione sociale del cedente/prestatore"),
  VatNumber: z.string().optional().describe("Partita IVA del cedente/prestatore"),
  FiscalCode: z.string().optional().describe("Codice fiscale del cedente/prestatore"),
});

// Schema Zod per una riga dell'autofattura
const ItemSchema = z.object({
  Description: z.string().describe("Descrizione della riga"),
  Quantity: z.number().optional().describe("Quantità"),
  PricePerUnit: z.number().optional().describe("Prezzo unitario"),
  VatRateCode: z.string().optional().describe("Codice aliquota IVA (es. '22')"),
  Units: z.string().optional().describe("Unità di misura (es. 'pz', 'ore')"),
});

// Schema Zod completo per il body dell'autofattura
// L'autofattura viene emessa verso sé stessi (es. per reverse charge): il campo principale è Seller
const SelfInvoiceInputSchema = z.object({
  Code: z.string().optional().describe("Numero documento"),
  SectionalID: z.number().int().positive().optional().describe("ID del sezionale"),
  IssueDate: z.string().optional().describe("Data di emissione (formato ISO 8601)"),
  AccountingDate: z.string().optional().describe("Data contabile (formato ISO 8601)"),
  Currency: z.string().optional().describe("Codice valuta (es. 'EUR')"),
  Seller: SellerSchema.optional().describe("Dati del cedente/prestatore (controparte nell'autofattura)"),
  Items: z.array(ItemSchema).optional().describe("Righe del documento"),
  DocumentNotes: z.string().optional().describe("Note sul documento"),
  Notes: z.string().optional().describe("Note interne"),
});

const ENDPOINT = "/SelfInvoice";

export const selfInvoiceTools: ToolDefinition[] = [
  // ── 1. Lista ────────────────────────────────────────────────────────────────
  {
    name: "self_invoice_list",
    description: "Recupera la lista delle autofatture",
    inputSchema: z.object({}),
    handler: async () => {
      try {
        const { data } = await apiClient.get(ENDPOINT);
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nel recupero della lista autofatture: ${String(err)}`);
      }
    },
  },

  // ── 2. Creazione ────────────────────────────────────────────────────────────
  {
    name: "self_invoice_create",
    description: "Crea una nuova autofattura (es. per reverse charge). Il campo principale della controparte è Seller",
    inputSchema: SelfInvoiceInputSchema,
    handler: async (input) => {
      try {
        const { data } = await apiClient.post(ENDPOINT, input);
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nella creazione dell'autofattura: ${String(err)}`);
      }
    },
  },

  // ── 3. Aggiornamento ────────────────────────────────────────────────────────
  {
    name: "self_invoice_update",
    description: "Aggiorna un'autofattura esistente tramite ID",
    inputSchema: SelfInvoiceInputSchema.extend({
      id: z.number().int().positive().describe("ID dell'autofattura da aggiornare"),
    }),
    handler: async (input) => {
      try {
        const { id, ...body } = input as { id: number } & Record<string, unknown>;
        const { data } = await apiClient.put(ENDPOINT, body, { params: { id } });
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nell'aggiornamento dell'autofattura: ${String(err)}`);
      }
    },
  },

  // ── 4. Eliminazione ─────────────────────────────────────────────────────────
  {
    name: "self_invoice_delete",
    description: "Elimina un'autofattura tramite ID",
    inputSchema: z.object({
      id: z.number().int().positive().describe("ID dell'autofattura da eliminare"),
    }),
    handler: async (input) => {
      try {
        const { id } = input as { id: number };
        const { data } = await apiClient.delete(ENDPOINT, { params: { id } });
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nell'eliminazione dell'autofattura: ${String(err)}`);
      }
    },
  },

  // ── 5. Prossimo numero documento ────────────────────────────────────────────
  {
    name: "self_invoice_next_code",
    description: "Ottieni il prossimo numero disponibile per un'autofattura",
    inputSchema: z.object({
      SectionalID: z.number().int().positive().optional().describe("ID del sezionale (opzionale)"),
    }),
    handler: async (input) => {
      try {
        const { data } = await apiClient.post(`${ENDPOINT}/action/NextCode`, input);
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nel recupero del prossimo numero autofattura: ${String(err)}`);
      }
    },
  },

  // ── 6. Trasmissione (SDI/fatturazione elettronica) ──────────────────────────
  {
    name: "self_invoice_transmit",
    description: "Trasmette un'autofattura al Sistema di Interscambio (SDI) per la fatturazione elettronica",
    inputSchema: z.object({
      id: z.number().int().positive().describe("ID dell'autofattura da trasmettere"),
    }),
    handler: async (input) => {
      try {
        const { id } = input as { id: number };
        const { data } = await apiClient.post(`${ENDPOINT}/action/Transmit`, undefined, {
          params: { id },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nella trasmissione dell'autofattura: ${String(err)}`);
      }
    },
  },

  // ── 7. Calcolo totali (senza salvataggio) ───────────────────────────────────
  {
    name: "self_invoice_calculate_totals",
    description: "Calcola i totali di un'autofattura senza salvarla",
    inputSchema: SelfInvoiceInputSchema,
    handler: async (input) => {
      try {
        const { data } = await apiClient.post(`${ENDPOINT}/action/CalculateTotals`, input);
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nel calcolo dei totali dell'autofattura: ${String(err)}`);
      }
    },
  },
];
