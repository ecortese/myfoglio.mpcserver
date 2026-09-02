# Deploy in produzione — myfoglio MCP Server

Guida al deploy del server MCP **myfoglio** in produzione tramite Docker e GitHub Actions CI/CD.

---

## 1. Docker manuale

### Build dell'immagine

```bash
docker build -t myfoglio-mcp .
```

### Avvio del container

```bash
docker run \
  -e MYFOGLIO_BASE_URL=https://api.myfoglio.com \
  -e MYFOGLIO_API_KEY=your_api_key \
  -e MYFOGLIO_API_SECRET=your_api_secret \
  -e MYFOGLIO_REFRESH_TOKEN=your_refresh_token \
  -e MCP_TRANSPORT=http \
  -e MCP_HTTP_PORT=3000 \
  -p 3000:3000 \
  --restart unless-stopped \
  myfoglio-mcp
```

### Verifica

```bash
curl http://localhost:3000/health
```

---

## 2. GitHub Actions CI/CD

Il workflow `.github/workflows/ci.yml` viene attivato automaticamente ad ogni push sul branch `main`.

### Secret necessari

Configura i seguenti secret nel repository GitHub (**Settings → Secrets and variables → Actions**):

| Secret | Descrizione |
|--------|-------------|
| `REGISTRY_URL` | URL del registro Docker |
| `REGISTRY_USERNAME` | Username per il login al registro |
| `REGISTRY_PASSWORD` | Password o PAT per il registro |
| `MYFOGLIO_API_KEY` | Client id OAuth2 MyFoglio |
| `MYFOGLIO_API_SECRET` | Client secret OAuth2 MyFoglio |
| `MYFOGLIO_REFRESH_TOKEN` | Refresh token di produzione |

---

## 3. Deploy su VPS o cloud con Docker Compose

### docker-compose.yml di esempio

```yaml
version: '3.8'
services:
  myfoglio-mcp:
    image: ghcr.io/ecortese/myfoglio.mpcserver:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - MYFOGLIO_BASE_URL=${MYFOGLIO_BASE_URL}
      - MYFOGLIO_API_KEY=${MYFOGLIO_API_KEY}
      - MYFOGLIO_API_SECRET=${MYFOGLIO_API_SECRET}
      - MYFOGLIO_REFRESH_TOKEN=${MYFOGLIO_REFRESH_TOKEN}
      - MCP_TRANSPORT=http
      - MCP_HTTP_PORT=3000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

### Variabili d'ambiente in produzione

Crea un file `.env` nella stessa cartella del `docker-compose.yml` (non committarlo mai nel repository):

```env
MYFOGLIO_BASE_URL=https://api.myfoglio.com
MYFOGLIO_API_KEY=your_api_key
MYFOGLIO_API_SECRET=your_api_secret
MYFOGLIO_REFRESH_TOKEN=your_refresh_token
```

### Avvio

```bash
docker compose up -d
```

---

## 4. Health check e monitoraggio

Il server espone l'endpoint `/health` in modalità HTTP per i controlli di stato:

```bash
curl http://localhost:3000/health
```

---

## 5. Aggiornamento dell'immagine

Ogni push su `main` attiva il workflow CI/CD che pubblica automaticamente una nuova immagine con tag `latest`.

```bash
docker compose pull
docker compose up -d
```
