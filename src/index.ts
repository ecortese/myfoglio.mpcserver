#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { config } from "./config.js";
import { createServer } from "./server.js";
import { allTools } from "./tools/index.js";
import { createClient } from "./client.js";

async function main(): Promise<void> {
  // Support --transport flag as well as env var
  const transportArg = process.argv.find((a) => a.startsWith("--transport="));
  const transport =
    (transportArg?.split("=")[1] as "stdio" | "http" | undefined) ??
    config.MCP_TRANSPORT;

  const server = createServer(allTools);

  if (transport === "http") {
    // ── HTTP / SSE transport ────────────────────────────────────────────────
    const app = express();
    app.use(express.json());

    app.get("/health", (_req, res) => {
      res.status(200).json({
        status: "ok",
        transport: "http",
        service: "myfoglio-mcp",
        version: "0.1.0",
      });
    });

    const httpTransport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
    });

    app.all("/mcp", async (req, res) => {
      // Allow per-request base URL override via custom header
      const baseUrlOverride = req.headers["x-myfoglio-base-url"] as
        | string
        | undefined;

      if (baseUrlOverride) {
        // Attach the override to the request so tool handlers can pick it up
        (req as express.Request & { mcpBaseUrl?: string }).mcpBaseUrl =
          baseUrlOverride;
      }

      await httpTransport.handleRequest(req, res);
    });

    await server.connect(httpTransport);

    app.listen(config.MCP_HTTP_PORT, () => {
      console.error(
        `[myfoglio-mcp] HTTP transport listening on port ${config.MCP_HTTP_PORT}`
      );
      console.error(`  GET  /health — health check`);
      console.error(`  POST /mcp     — MCP endpoint`);
      console.error(
        `  Header X-Myfoglio-Base-Url overrides the API base URL per request`
      );
    });
  } else {
    // ── stdio transport (default) ───────────────────────────────────────────
    const stdioTransport = new StdioServerTransport();
    await server.connect(stdioTransport);
    console.error("[myfoglio-mcp] stdio transport ready");
  }
}

main().catch((err) => {
  console.error("[myfoglio-mcp] Fatal error:", err);
  process.exit(1);
});
