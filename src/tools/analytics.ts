import { z } from "zod";
import { apiClient } from "../client.js";
import type { ToolDefinition } from "../server.js";

// Schema riutilizzabile per il parametro anno fiscale
const YearSchema = z.object({
  year: z.number().int().min(2000).max(2100).describe("Anno fiscale (es. 2024)"),
});

export const analyticsTools: ToolDefinition[] = [
  // ── 1. Riepilogo analitico per anno ─────────────────────────────────────────
  {
    name: "analytics_year",
    description: "Recupera il riepilogo analitico generale per l'anno specificato",
    inputSchema: YearSchema,
    handler: async (input) => {
      try {
        const { year } = input as { year: number };
        const { data } = await apiClient.get(`/Analytics/${year}`);
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nel recupero dell'analisi annuale: ${String(err)}`);
      }
    },
  },

  // ── 2. Riepilogo IVA per anno ────────────────────────────────────────────────
  {
    name: "analytics_vat",
    description: "Recupera il riepilogo IVA per l'anno specificato",
    inputSchema: YearSchema,
    handler: async (input) => {
      try {
        const { year } = input as { year: number };
        const { data } = await apiClient.get(`/Analytics/${year}/Vat`);
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nel recupero del riepilogo IVA: ${String(err)}`);
      }
    },
  },

  // ── 3. Riepilogo finanziario per anno ────────────────────────────────────────
  {
    name: "analytics_financial_summary",
    description: "Recupera il riepilogo finanziario (ricavi, costi, margini) per l'anno specificato",
    inputSchema: YearSchema,
    handler: async (input) => {
      try {
        const { year } = input as { year: number };
        const { data } = await apiClient.get(`/Analytics/${year}/FinancialSummary`);
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nel recupero del riepilogo finanziario: ${String(err)}`);
      }
    },
  },

  // ── 4. Flusso di cassa per anno ──────────────────────────────────────────────
  {
    name: "analytics_cashflow",
    description: "Recupera il flusso di cassa (cashflow) per l'anno specificato",
    inputSchema: YearSchema,
    handler: async (input) => {
      try {
        const { year } = input as { year: number };
        const { data } = await apiClient.get(`/Analytics/${year}/Cashflow`);
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nel recupero del cashflow: ${String(err)}`);
      }
    },
  },
];
