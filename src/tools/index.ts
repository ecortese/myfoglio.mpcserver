// Tool barrel — re-export all tool definition arrays.
// Add new tool files here as they are implemented.

// export { accountTools } from "./account.js";
export { contactTools } from "./contact.js";
export { productTools } from "./product.js";
export { bankTools } from "./bank.js";
export { searchTools } from "./search.js";
export { validationTools } from "./validation.js";
// export { invoiceTools } from "./invoice.js";
// export { analyticsTools } from "./analytics.js";

import { contactTools } from "./contact.js";
import { productTools } from "./product.js";
import { bankTools } from "./bank.js";
import { searchTools } from "./search.js";
import { validationTools } from "./validation.js";

export const allTools: import("../server.js").ToolDefinition[] = [
  // ...accountTools,
  ...contactTools,
  ...productTools,
  ...bankTools,
  ...searchTools,
  ...validationTools,
  // ...invoiceTools,
  // ...analyticsTools,
];
