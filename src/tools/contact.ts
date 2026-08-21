import { z } from "zod";
import { apiClient } from "../client.js";
import type { ToolDefinition } from "../server.js";

export const contactTools: ToolDefinition[] = [
  {
    name: "contact_list",
    description: "Recupera la lista di tutti i contatti",
    inputSchema: z.object({}),
    handler: async () => {
      const { data } = await apiClient.get("/Contact");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
  {
    name: "contact_create",
    description: "Crea un nuovo contatto",
    inputSchema: z.object({
      CompanyName: z.string().optional().describe("Ragione sociale dell'azienda"),
      Name: z.string().optional().describe("Nome del contatto"),
      Lastname: z.string().optional().describe("Cognome del contatto"),
      Email: z.string().optional().describe("Indirizzo email"),
      VatNumber: z.string().optional().describe("Partita IVA"),
      FiscalCode: z.string().optional().describe("Codice fiscale"),
      PEC: z.string().optional().describe("Posta Elettronica Certificata"),
      FatturaPABureauCode: z.string().optional().describe("Codice ufficio per la fatturazione PA"),
      Notes: z.string().optional().describe("Note aggiuntive sul contatto"),
    }),
    handler: async (input) => {
      const { data } = await apiClient.post("/Contact", input);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
  {
    name: "contact_update",
    description: "Aggiorna un contatto esistente tramite ID",
    inputSchema: z.object({
      id: z.number().int().positive().describe("ID del contatto da aggiornare"),
      CompanyName: z.string().optional().describe("Ragione sociale dell'azienda"),
      Name: z.string().optional().describe("Nome del contatto"),
      Lastname: z.string().optional().describe("Cognome del contatto"),
      Email: z.string().optional().describe("Indirizzo email"),
      VatNumber: z.string().optional().describe("Partita IVA"),
      FiscalCode: z.string().optional().describe("Codice fiscale"),
      PEC: z.string().optional().describe("Posta Elettronica Certificata"),
      FatturaPABureauCode: z.string().optional().describe("Codice ufficio per la fatturazione PA"),
      Notes: z.string().optional().describe("Note aggiuntive sul contatto"),
    }),
    handler: async (input) => {
      const { id, ...body } = input as { id: number } & Record<string, unknown>;
      const { data } = await apiClient.put("/Contact", body, { params: { id } });
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
  {
    name: "contact_delete",
    description: "Elimina un contatto tramite ID",
    inputSchema: z.object({
      id: z.number().int().positive().describe("ID del contatto da eliminare"),
    }),
    handler: async (input) => {
      const { id } = input as { id: number };
      const { data } = await apiClient.delete("/Contact", { params: { id } });
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  },
];
