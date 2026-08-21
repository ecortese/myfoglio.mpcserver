import type { ToolDefinition } from "../server.js";
import { buildDocumentTools } from "./document-helpers.js";

// I 7 tool standard per le note di credito (CreditNote)
export const creditNoteTools: ToolDefinition[] = buildDocumentTools(
  "CreditNote",
  "credit_note",
  "nota di credito"
);
