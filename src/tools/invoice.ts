import type { ToolDefinition } from "../server.js";
import { buildDocumentTools } from "./document-helpers.js";

// I 7 tool standard per le fatture attive (Invoice)
export const invoiceTools: ToolDefinition[] = buildDocumentTools(
  "Invoice",
  "invoice",
  "fattura"
);
