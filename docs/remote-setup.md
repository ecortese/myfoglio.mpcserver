# Setup remoto — myfoglio MCP Server (modalità HTTP)

Guida per eseguire il server MCP **myfoglio** in modalità **HTTP remota**, esposta come endpoint REST raggiungibile da client MCP compatibili.

---

## Prerequisiti

| Requisito | Versione minima |
|-----------|----------------|
| Node.js | ≥ 20 |
| npm | ≥ 10 |
| Account myfoglio | con API token attivo |

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
MYFOGLIO_TOKEN=il-tuo-token-api
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

Risposta attesa:

```json
{ "status": "ok" }
```

Per testare l'endpoint MCP con il client di ispezione ufficiale:

```bash
npx @modelcontextprotocol/inspector http://localhost:3000
```

---

## 6. Override URL base per tenant diversi

Il server supporta l'override dell'URL base delle API myfoglio per singola richiesta tramite l'header HTTP:

```
X-Myfoglio-Base-Url: https://api-staging.myfoglio.com
```

Esempio con `curl`:

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "X-Myfoglio-Base-Url: https://api-staging.myfoglio.com" \
  -d '{"method": "tools/list"}'
```

Questo consente di servire più tenant o ambienti (produzione, staging, sviluppo) dalla stessa istanza del server.

---

## 7. Considerazioni di sicurezza

L'endpoint HTTP **non include autenticazione integrata** — è responsabilità dell'infrastruttura proteggere l'accesso. Raccomandazioni:

- **Reverse proxy:** usa nginx o Caddy per terminare TLS e aggiungere autenticazione (es. Basic Auth, JWT).
- **Rete privata:** esponi il server solo sulla rete interna o tramite VPN; non renderlo pubblicamente accessibile senza protezione.
- **Variabili d'ambiente:** non inserire mai il `MYFOGLIO_TOKEN` direttamente nell'URL o nei log.
- **Rate limiting:** configura il rate limiting sul reverse proxy per prevenire abusi.

Esempio di configurazione nginx minimale:

```nginx
server {
    listen 443 ssl;
    server_name mcp.example.com;

    location / {
        auth_basic "MCP Server";
        auth_basic_user_file /etc/nginx/.htpasswd;
        proxy_pass http://localhost:3000;
    }
}
```

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

> Per i client che supportano l'autenticazione via header, aggiungi il token di accesso all'header `Authorization` configurato sul reverse proxy.

---

## Variabili d'ambiente disponibili

| Variabile | Obbligatoria | Valore predefinito | Descrizione |
|-----------|:---:|---|---|
| `MYFOGLIO_TOKEN` | ✅ | — | Token API per autenticarsi con myfoglio |
| `MYFOGLIO_BASE_URL` | ❌ | `https://api.myfoglio.com` | URL base delle API myfoglio (override globale) |
| `MCP_TRANSPORT` | ❌ | `stdio` | Modalità di trasporto: `stdio` o `http` |
| `MCP_HTTP_PORT` | ❌ | `3000` | Porta su cui ascolta il server HTTP |
