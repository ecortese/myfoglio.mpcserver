# Setup remoto — myfoglio MCP Server

Guida per eseguire il server MCP **myfoglio** in modalità **HTTP remota**, esposta come endpoint REST raggiungibile da client MCP compatibili.

---

## Prerequisiti

| Requisito | Versione minima |
|-----------|----------------|
| Node.js | ≥ 20 |
| npm | ≥ 10 |
| Account myfoglio | con credenziali OAuth2 V2 attive |

---

## 1. Clona il repository e installa le dipendenze

```bash
git clone https://github.com/ecortese/myfoglio.mpcserver
cd myfoglio.mpcserver
npm install
```

---

## 2. Configura le variabili d'ambiente

Copia il file di esempio:

```bash
cp .env.example .env
```

Imposta le variabili per la modalità HTTP:

```env
MYFOGLIO_BASE_URL=https://api.myfoglio.com
MYFOGLIO_API_KEY=your_api_key
MYFOGLIO_API_SECRET=your_api_secret
MYFOGLIO_REFRESH_TOKEN=your_refresh_token
MCP_TRANSPORT=http
MCP_HTTP_PORT=3000
```


---

## 3. Compila il progetto

```bash
npm run build
```

---

## 4. Avvia il server

```bash
npm start
# oppure specificando il trasporto dalla riga di comando:
node dist/index.js --transport http
```

Il server si avvierà sulla porta indicata da `MCP_HTTP_PORT` (default: `3000`).

---

## 5. Verifica che il server sia attivo

```bash
curl http://localhost:3000/health
```

---

## 6. Override URL base per tenant diversi

Il server supporta l'override dell'URL base delle API myfoglio per singola richiesta tramite l'header HTTP:

```http
X-Myfoglio-Base-Url: https://api-staging.myfoglio.com
```

Questo consente di servire più tenant o ambienti (produzione, staging, sviluppo) dalla stessa istanza del server.

---

## 7. Considerazioni di sicurezza

- Non committare `.env` o secret in repository.
- Memorizza `MYFOGLIO_API_KEY`, `MYFOGLIO_API_SECRET` e `MYFOGLIO_REFRESH_TOKEN` nelle secret dell'ambiente di deploy.
- Usa un reverse proxy TLS per esporre l'endpoint HTTP in modo sicuro.
- Non registrare mai i token nei log.

---

## 8. Integrazione con client MCP HTTP

Per configurare un client MCP che si connette al server in modalità HTTP, usa l'URL dell'endpoint:

```json
{
  "mcpServers": {
    "myfoglio": {
      "url": "http://localhost:3000",
      "headers": {
        "X-Myfoglio-Base-Url": "https://api.myfoglio.com"
      }
    }
  }
}
```
