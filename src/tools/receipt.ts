import type { ToolDefinition } from "../server.js";
import { buildDocumentTools } from "./document-helpers.js";

// I 7 tool standard per le ricevute (Receipt)
export const receiptTools: ToolDefinition[] = buildDocumentTools(
  "Receipt",
  "receipt",
  "ricevuta"
);
