# myfoglio MCP Server

> An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that exposes [myfoglio](https://www.myfoglio.com) REST APIs as AI-agent tools.

![Build](https://github.com/ecortese/myfoglio.mpcserver/actions/workflows/ci.yml/badge.svg)

## Features

- 🔌 Dual transport — `stdio` for local use with Claude Desktop, `HTTP` for remote deployments
- 🌍 Multi-environment — point at production, staging, or dev via `MYFOGLIO_BASE_URL`
- 🔐 OAuth2 V2 support — API key / secret authentication with client credentials and refresh token handling
- 🐳 Containerised — multi-stage Docker image ready to deploy
- ⚡ TypeScript-first — strict mode, Zod-validated configuration

## Quick start

```bash
# 1. Clone
git clone https://github.com/ecortese/myfoglio.mpcserver.git
cd myfoglio.mpcserver

# 2. Install dependencies
npm install

# 3. Configure
cp .env.example .env
# Fill in MYFOGLIO_API_KEY and MYFOGLIO_API_SECRET

# 4a. Run locally (stdio)
npm run dev

# 4b. Run as HTTP server
MCP_TRANSPORT=http npm run dev
```

## Authentication model

The server uses a single supported authentication model based on MyFoglio API key and secret credentials.

Required configuration:

- `MYFOGLIO_API_KEY` + `MYFOGLIO_API_SECRET` — API key/secret pair used to obtain an OAuth access token
- Optional `MYFOGLIO_REFRESH_TOKEN` — refresh token reused automatically when the access token expires

The OAuth2 token exchange uses the `Authorization` header with Basic auth and the versioned Accept header:

```http
Authorization: Basic <base64(api_key:api_secret)>
Accept: application/vnd.myfoglio.v2+json
```

## Documentation

| Guide | Description |
|-------|-------------|
| [Local setup](docs/local-setup.md) | Install, configure `.env`, integrate with Claude Desktop |
| [Remote setup](docs/remote-setup.md) | Run as HTTP server and override base URLs per request |
| [Deploy](docs/deploy.md) | Docker build, GitHub Actions CI/CD, rollout |

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MYFOGLIO_BASE_URL` | `https://api.myfoglio.com` | API base URL |
| `MYFOGLIO_API_KEY` | — | API key used to obtain the OAuth access token |
| `MYFOGLIO_API_SECRET` | — | API secret paired with the API key |
| `MYFOGLIO_REFRESH_TOKEN` | — | Optional refresh token reused automatically |
| `API_VERSION` | `2` | API version used in the `Accept` header |
| `MCP_TRANSPORT` | `stdio` | `stdio` or `http` |
| `MCP_HTTP_PORT` | `3000` | Port for HTTP transport |

## License

MIT
