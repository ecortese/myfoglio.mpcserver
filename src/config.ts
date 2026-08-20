import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  MYFOGLIO_BASE_URL: z.string().url().default("https://api.myfoglio.com"),
  MYFOGLIO_TOKEN: z.string().min(1, "MYFOGLIO_TOKEN is required"),
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

export const config = result.data;
