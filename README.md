# myfoglio MCP Server

> An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that exposes [myfoglio](https://www.myfoglio.com) REST APIs as AI-agent tools.

![Build](https://github.com/ecortese/myfoglio.mpcserver/actions/workflows/ci.yml/badge.svg)

## Features

- 🔌 **Dual transport** — `stdio` for local use with Claude Desktop, `HTTP/SSE` for remote deployments
- 🌍 **Multi-environment** — point at production, staging, or dev via `MYFOGLIO_BASE_URL` env var (or `X-Myfoglio-Base-Url` header at runtime)
- 🔑 **Secure** — Bearer token read from environment, never logged or exposed
- 🐳 **Containerised** — multi-stage Docker image ready to deploy
- ⚡ **TypeScript-first** — strict mode, Zod-validated inputs

## Quick start

```bash
# 1. Clone
git clone https://github.com/ecortese/myfoglio.mpcserver.git
cd myfoglio.mpcserver

# 2. Install dependencies
npm install

# 3. Configure
cp .env.example .env
# Edit .env and set MYFOGLIO_TOKEN

# 4a. Run locally (stdio — for Claude Desktop)
npm run dev

# 4b. Run as HTTP server
MCP_TRANSPORT=http npm run dev
```

## Documentation

| Guide | Description |
|-------|-------------|
| [Local setup](docs/local-setup.md) | Install, configure `.env`, integrate with Claude Desktop |
| [Remote setup](docs/remote-setup.md) | Run as HTTP/SSE server, multi-environment headers |
| [Deploy](docs/deploy.md) | Docker build, GitHub Actions CI/CD, rollback |

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MYFOGLIO_BASE_URL` | `https://api.myfoglio.com` | API base URL |
| `MYFOGLIO_TOKEN` | _(required)_ | Bearer token |
| `MCP_TRANSPORT` | `stdio` | `stdio` or `http` |
| `MCP_HTTP_PORT` | `3000` | Port for HTTP transport |

## License

MIT
