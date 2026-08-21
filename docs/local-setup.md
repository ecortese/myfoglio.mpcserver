# Setup locale — myfoglio MCP Server

Guida per eseguire il server MCP **myfoglio** in locale, in modalità **stdio**, per l'integrazione con Claude Desktop.

---

## Prerequisiti

| Requisito | Versione minima |
|-----------|----------------|
| Node.js | ≥ 20 |
| npm | ≥ 10 |
| Account myfoglio | con API token attivo |

---

## 1. Clona il repository

```bash
git clone https://github.com/ecortese/myfoglio.mpcserver
cd myfoglio.mpcserver
```

---

## 2. Installa le dipendenze

```bash
npm install
```

---

## 3. Configura le variabili d'ambiente

Copia il file di esempio e compilalo con le tue credenziali:

```bash
cp .env.example .env
```

Apri `.env` e imposta almeno la variabile obbligatoria:

```env
MYFOGLIO_TOKEN=il-tuo-token-api
```

---

## 4. Compila il progetto

```bash
npm run build
```

I file compilati saranno generati nella cartella `dist/`.

---

## 5. Esegui in modalità stdio

```bash
npm start
# oppure direttamente:
node dist/index.js
```

In modalità stdio il server legge i messaggi MCP dallo **stdin** e scrive le risposte sullo **stdout**. Non viene avviato nessun server HTTP.

---

## 6. Integrazione con Claude Desktop

Aggiungi la seguente configurazione al file `claude_desktop_config.json` di Claude Desktop.

**Percorso del file di configurazione:**

- **macOS / Linux:** `~/.config/claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "myfoglio": {
      "command": "node",
      "args": ["/path/to/myfoglio.mpcserver/dist/index.js"],
      "env": {
        "MYFOGLIO_TOKEN": "il-tuo-token",
        "MYFOGLIO_BASE_URL": "https://api.myfoglio.com"
      }
    }
  }
}
```

> **Nota:** sostituisci `/path/to/myfoglio.mpcserver` con il percorso assoluto della cartella clonata sul tuo sistema.

---

## 7. Test rapido

Dopo aver riavviato Claude Desktop, verifica che il server sia attivo:

1. Apri Claude Desktop e avvia una nuova conversazione.
2. Chiedi: *"Lista le mie fatture myfoglio"* oppure *"Recupera il riepilogo analitico del 2024"*.
3. Se il server è configurato correttamente, Claude invocherà automaticamente i tool MCP appropriati.

Per un test dalla riga di comando puoi usare il client MCP di test ufficiale:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

---

## 8. Variabili d'ambiente disponibili

| Variabile | Obbligatoria | Valore predefinito | Descrizione |
|-----------|:---:|---|---|
| `MYFOGLIO_TOKEN` | ✅ | — | Token API per autenticarsi con myfoglio |
| `MYFOGLIO_BASE_URL` | ❌ | `https://api.myfoglio.com` | URL base delle API myfoglio |
| `MCP_TRANSPORT` | ❌ | `stdio` | Modalità di trasporto: `stdio` o `http` |
| `MCP_HTTP_PORT` | ❌ | `3000` | Porta HTTP (solo se `MCP_TRANSPORT=http`) |

---

## 9. Override URL per sviluppo locale

Se stai sviluppando o testando contro un'istanza locale delle API myfoglio, imposta la variabile `MYFOGLIO_BASE_URL` nel file `.env`:

```env
MYFOGLIO_BASE_URL=http://localhost:5000
```

In alternativa, puoi passarla direttamente nella configurazione Claude Desktop all'interno di `"env"`:

```json
"env": {
  "MYFOGLIO_TOKEN": "il-tuo-token",
  "MYFOGLIO_BASE_URL": "http://localhost:5000"
}
```

Questo consente di puntare a un ambiente di staging o a un mock server senza modificare il codice sorgente.
