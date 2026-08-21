import { z } from "zod";
import { apiClient } from "../client.js";
import type { ToolDefinition } from "../server.js";

export const fileTools: ToolDefinition[] = [
  // ── 1. Recupero file per ID ──────────────────────────────────────────────────
  {
    name: "file_get",
    description: "Recupera un file dallo storage tramite il suo ID, il suo Public ID o il suo Temporary ID",
    inputSchema: z.object({
      id: z.string().describe("ID univoco del file da recuperare"),
    }),
    handler: async (input) => {
      try {
        const { id } = input as { id: string };
        const { data } = await apiClient.get("/File", { params: { id } });
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nel recupero del file: ${String(err)}`);
      }
    },
  },

  // ── 2. Eliminazione file per ID ──────────────────────────────────────────────
  {
    name: "file_delete",
    description: "Elimina un file dallo storage tramite il suo ID",
    inputSchema: z.object({
      id: z.string().describe("ID univoco del file da eliminare"),
    }),
    handler: async (input) => {
      try {
        const { id } = input as { id: string };
        const { data } = await apiClient.delete("/File", { params: { id } });
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nell'eliminazione del file: ${String(err)}`);
      }
    },
  },

  // ── 3. Lista file ────────────────────────────────────────────────────────────
  {
    name: "file_list",
    description: "Recupera la lista dei file presenti nello storage",
    inputSchema: z.object({}),
    handler: async () => {
      try {
        const { data } = await apiClient.get("/File/list");
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nel recupero della lista file: ${String(err)}`);
      }
    },
  },

  // ── 4. Caricamento file tramite Base64 ───────────────────────────────────────
  // Il caricamento multipart/form-data non è direttamente gestibile via MCP (JSON),
  // quindi il file viene accettato come stringa Base64 e convertito in Buffer prima dell'invio.
  {
    name: "file_upload_base64",
    description: "Carica un file nello storage fornendo il contenuto codificato in Base64",
    inputSchema: z.object({
      filename: z.string().describe("Nome del file da caricare (es. 'fattura.pdf')"),
      contentBase64: z.string().describe("Contenuto del file codificato in Base64"),
      contentType: z.string().describe("Tipo MIME del file (es. 'application/pdf', 'image/png')"),
    }),
    handler: async (input) => {
      try {
        const { filename, contentBase64, contentType } = input as {
          filename: string;
          contentBase64: string;
          contentType: string;
        };

        // Decodifica il Base64 in Buffer per la richiesta multipart
        const fileBuffer = Buffer.from(contentBase64, "base64");

        // Importazione dinamica di form-data (compatibile con CommonJS e ESM)
        const FormData = (await import("form-data")).default;
        const form = new FormData();
        form.append("file", fileBuffer, { filename, contentType });

        const { data } = await apiClient.post("/File", form, {
          headers: form.getHeaders(),
        });

        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nel caricamento del file: ${String(err)}`);
      }
    },
  },
];
