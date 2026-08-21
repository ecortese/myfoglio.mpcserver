// Tool barrel — re-export all tool definition arrays.
// Add new tool files here as they are implemented.

// export { accountTools } from "./account.js";
export { contactTools } from "./contact.js";
export { productTools } from "./product.js";
export { bankTools } from "./bank.js";
export { searchTools } from "./search.js";
export { validationTools } from "./validation.js";
// export { analyticsTools } from "./analytics.js";
export { invoiceTools } from "./invoice.js";
export { creditNoteTools } from "./credit-note.js";
export { estimateTools } from "./estimate.js";
export { receiptTools } from "./receipt.js";
export { deliveryNoteTools } from "./delivery-note.js";
export { proformaTools } from "./proforma.js";
export { receivedInvoiceTools } from "./received-invoice.js";
export { receivedCreditNoteTools } from "./received-credit-note.js";

import { contactTools } from "./contact.js";
import { productTools } from "./product.js";
import { bankTools } from "./bank.js";
import { searchTools } from "./search.js";
import { validationTools } from "./validation.js";
import { invoiceTools } from "./invoice.js";
import { creditNoteTools } from "./credit-note.js";
import { estimateTools } from "./estimate.js";
import { receiptTools } from "./receipt.js";
import { deliveryNoteTools } from "./delivery-note.js";
import { proformaTools } from "./proforma.js";
import { receivedInvoiceTools } from "./received-invoice.js";
import { receivedCreditNoteTools } from "./received-credit-note.js";

export const allTools: import("../server.js").ToolDefinition[] = [
  // ...accountTools,
  ...contactTools,
  ...productTools,
  ...bankTools,
  ...searchTools,
  ...validationTools,
  // ...analyticsTools,
  ...invoiceTools,
  ...creditNoteTools,
  ...estimateTools,
  ...receiptTools,
  ...deliveryNoteTools,
  ...proformaTools,
  ...receivedInvoiceTools,
  ...receivedCreditNoteTools,
];
