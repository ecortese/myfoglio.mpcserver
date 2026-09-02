import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  MYFOGLIO_BASE_URL: z.string().url().default("https://api.myfoglio.com"),
  MYFOGLIO_API_KEY: z.string().trim().min(1).optional(),
  MYFOGLIO_API_SECRET: z.string().trim().min(1).optional(),
  MYFOGLIO_CLIENT_ID: z.string().trim().min(1).optional(),
  MYFOGLIO_CLIENT_SECRET: z.string().trim().min(1).optional(),
  API_VERSION: z.coerce.number().int().positive().default(2),
  MCP_TRANSPORT: z.enum(["stdio", "http"]).default("stdio"),
  MCP_HTTP_PORT: z.coerce.number().int().positive().default(3000),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  const errors = result.error.issues
    .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  console.error(`[myfoglio-mcp] Configuration error:\n${errors}`);
  process.exit(1);
}

const data = result.data;
const apiKey = data.MYFOGLIO_API_KEY ?? data.MYFOGLIO_CLIENT_ID;
const apiSecret = data.MYFOGLIO_API_SECRET ?? data.MYFOGLIO_CLIENT_SECRET;

if (!apiKey || !apiSecret) {
  console.error(
    "[myfoglio-mcp] Missing auth configuration: set MYFOGLIO_API_KEY and MYFOGLIO_API_SECRET in the environment."
  );
  process.exit(1);
}

export const config = {
  ...data,
  MYFOGLIO_API_KEY: apiKey,
  MYFOGLIO_API_SECRET: apiSecret,
  hasApiCredentials: true,
};
