import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type AxiosInstance } from "axios";
import { z } from "zod";

/** Shape of a tool registered on the MCP server. */
export interface ToolDefinition {
  name: string;
  description: string;
  /** Zod schema whose .shape is passed to server.tool() */
  inputSchema: z.ZodObject<Record<string, z.ZodTypeAny>>;
  handler: (
    input: Record<string, unknown>,
    client: AxiosInstance
  ) => Promise<{ content: { type: "text"; text: string }[] }>;
}

/**
 * Creates and configures the MCP server with all available tools.
 * Tools are registered lazily so the tool list can grow without touching this file.
 */
export function createServer(tools: ToolDefinition[]): McpServer {
  const server = new McpServer({
    name: "myfoglio-mcp",
    version: "0.1.0",
  });

  for (const tool of tools) {
    // Cast to any to avoid TS2589 from the SDK's deep generic inference
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (server as any).tool(
      tool.name,
      tool.description,
      tool.inputSchema.shape,
      async (input: Record<string, unknown>) => {
        return tool.handler(input, null as unknown as AxiosInstance);
      }
    );
  }

  return server;
}
