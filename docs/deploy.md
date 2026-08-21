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
  -e MYFOGLIO_TOKEN=il-tuo-token \
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

### Job `build`

Verifica la corretta compilazione TypeScript:

1. Checkout del codice
2. Setup di Node.js ≥ 20
3. `npm ci` — installazione dipendenze
4. `npm run build` — compilazione TypeScript

### Job `docker`

Costruisce e pubblica l'immagine Docker sul registro configurato:

1. Login al registro Docker (GitHub Container Registry o altro)
2. `docker build` con tag basato sul commit SHA e `latest`
3. `docker push` dell'immagine

### Secret necessari

Configura i seguenti secret nel repository GitHub (**Settings → Secrets and variables → Actions**):

| Secret | Descrizione |
|--------|-------------|
| `REGISTRY_URL` | URL del registro Docker (es. `ghcr.io`) |
| `REGISTRY_USERNAME` | Username per il login al registro |
| `REGISTRY_PASSWORD` | Password o Personal Access Token per il registro |
| `MYFOGLIO_TOKEN` | Token API myfoglio (usato nei test di integrazione) |

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
      - MYFOGLIO_TOKEN=${MYFOGLIO_TOKEN}
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
MYFOGLIO_TOKEN=il-tuo-token-di-produzione
```

### Avvio

```bash
docker compose up -d
```

### Verifica dello stato

```bash
docker compose ps
docker compose logs -f myfoglio-mcp
```

---

## 4. Health check e monitoraggio

Il server espone l'endpoint `/health` in modalità HTTP per i controlli di stato:

```bash
curl http://localhost:3000/health
# Risposta attesa: { "status": "ok" }
```

### Integrazione con Uptime Kuma / Grafana / altri

Configura un monitor HTTP su `http://<host>:3000/health` con:

- **Metodo:** GET
- **Codice atteso:** 200
- **Intervallo:** 30–60 secondi

### Log

I log vengono scritti sullo **stderr** in formato leggibile. Per raccoglierli con Docker:

```bash
docker logs myfoglio-mcp --follow
# oppure con docker compose:
docker compose logs -f myfoglio-mcp
```

Per la produzione si consiglia di redirigere i log a un aggregatore (Loki, CloudWatch, Datadog) tramite il driver di logging Docker configurato nel `docker-compose.yml`.

---

## 5. Aggiornamento dell'immagine

### Con GitHub Actions (automatico)

Ogni push su `main` attiva il workflow CI/CD che pubblica automaticamente una nuova immagine con tag `latest`.

### Aggiornamento manuale sul server

```bash
# Scarica la nuova immagine
docker compose pull

# Riavvia il container con la nuova immagine
docker compose up -d

# Verifica che il nuovo container sia in esecuzione
docker compose ps
```

### Rollback a una versione precedente

Ogni immagine è taggata anche con il commit SHA (es. `ghcr.io/ecortese/myfoglio.mpcserver:abc1234`). Per tornare a una versione precedente:

```bash
# Nel docker-compose.yml, sostituisci :latest con il tag desiderato
image: ghcr.io/ecortese/myfoglio.mpcserver:abc1234

# Poi riavvia
docker compose up -d
```
