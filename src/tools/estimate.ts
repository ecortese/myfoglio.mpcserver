import { z } from "zod";
import { apiClient } from "../client.js";
import type { ToolDefinition } from "../server.js";
import { buildDocumentTools, DocumentInputSchema } from "./document-helpers.js";

// Schema aggiuntivo specifico per i preventivi
const EstimateExtraSchema = z.object({
  Confirmed: z.boolean().optional().describe("Se true, il preventivo è confermato/accettato"),
  ExpirationDate: z.string().optional().describe("Data di scadenza del preventivo (formato ISO 8601)"),
});

// Schema completo per la creazione/aggiornamento di un preventivo
const EstimateInputSchema = DocumentInputSchema.merge(EstimateExtraSchema);

// I 7 tool standard per i preventivi, con override di create, update e calculate_totals
// per includere i campi aggiuntivi Confirmed e ExpirationDate
const baseTools = buildDocumentTools("Estimate", "estimate", "preventivo");

// Sostituisce create, update e calculate_totals con versioni che includono i campi extra
const estimateCreate: import("../server.js").ToolDefinition = {
  name: "estimate_create",
  description: "Crea un nuovo preventivo",
  inputSchema: EstimateInputSchema,
  handler: async (input) => {
    try {
      const { data } = await apiClient.post("/Estimate", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    } catch (err: unknown) {
      throw new Error(`Errore nella creazione del preventivo: ${String(err)}`);
    }
  },
};

const estimateUpdate: import("../server.js").ToolDefinition = {
  name: "estimate_update",
  description: "Aggiorna un preventivo esistente tramite ID",
  inputSchema: EstimateInputSchema.extend({
    id: z.number().int().positive().describe("ID del preventivo da aggiornare"),
  }),
  handler: async (input) => {
    try {
      const { id, ...body } = input as { id: number } & Record<string, unknown>;
      const { data } = await apiClient.put("/Estimate", body, { params: { id } });
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    } catch (err: unknown) {
      throw new Error(`Errore nell'aggiornamento del preventivo: ${String(err)}`);
    }
  },
};

const estimateCalculateTotals: import("../server.js").ToolDefinition = {
  name: "estimate_calculate_totals",
  description: "Calcola i totali di un preventivo senza salvarlo",
  inputSchema: EstimateInputSchema,
  handler: async (input) => {
    try {
      const { data } = await apiClient.post("/Estimate/action/CalculateTotals", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    } catch (err: unknown) {
      throw new Error(`Errore nel calcolo dei totali del preventivo: ${String(err)}`);
    }
  },
};

// Nomi dei tool da sostituire con versioni arricchite
const overriddenNames = new Set(["estimate_create", "estimate_update", "estimate_calculate_totals"]);

export const estimateTools: ToolDefinition[] = [
  // Tool base filtrati (escludendo quelli sovrascritti)
  ...baseTools.filter((t) => !overriddenNames.has(t.name)),
  // Versioni arricchite con i campi preventivo-specifici
  estimateCreate,
  estimateUpdate,
  estimateCalculateTotals,
];
