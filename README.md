# 🌅☕ GM Bot

Bot Discord che gestisce automaticamente il canale #gm con orari programmati e moderazione intelligente.

## 🚀 Funzionalità

### ⏰ Orario Attivo (7:00-12:00 UTC)
- Canale #gm sbloccato automaticamente
- Messaggio di benvenuto mattutino
- Accetta solo messaggi "gm" (case-insensitive)
- Reazione automatica ☕ ai messaggi validi
- Cancellazione messaggi non conformi con avviso temporaneo
- Supporto multi-server

### 🔒 Orario Inattivo (12:00-7:00 UTC)
- Canale #gm bloccato automaticamente
- Messaggio di chiusura giornaliero
- Permessi di scrittura rimossi per @everyone
- Keep-alive HTTP per monitoring

## 📋 Requisiti

- Node.js 20+
- Bot Discord con permessi:
  - Gestione Canali (Manage Channels)
  - Gestione Messaggi (Manage Messages)
  - Lettura/Invio Messaggi (Read/Send Messages)
  - Aggiunta Reazioni (Add Reactions)

## ⚙️ Setup Locale

1. Clona il repository:
```bash
git clone https://github.com/tuousername/gmBot.git
cd gmBot
```

2. Installa le dipendenze:
```bash
npm install
```

3. Crea file `.env`:
```env
DISCORD_TOKEN=il_tuo_token_discord
```

4. Avvia il bot:
```bash
npm start
```

## 🚀 Deploy su Railway

- Vedi [guida completa](./DEPLOY.md) per dettagli.

1. Fai il push su GitHub
2. Connetti il repository a Railway
3. Aggiungi la variabile d'ambiente `DISCORD_TOKEN`
4. Deploy automatico

Railway genererà un URL pubblico dove potrai monitorare lo stato del bot in tempo reale.

**Nota**: Il piano gratuito Railway offre 500 ore/mese (~16 ore/giorno). Per uso 24/7 considera l'upgrade a $5/mese.

## 🌍 Configurazione Server Discord

### Setup Iniziale:
1. Crea un canale chiamato esattamente **"gm"** (minuscolo)
2. Invita il bot nel server
3. Il bot gestirà automaticamente i permessi del canale

### Fusi Orari:
- **7:00 UTC** = 09:00 ora italiana (estate, UTC+2)
- **12:00 UTC** = 14:00 ora italiana (estate, UTC+2)

In inverno (UTC+1): 08:00-13:00 ora italiana

## 📊 Monitoring

Il bot espone un endpoint HTTP per il monitoring:

```json
GET /

{
  "status": "✅ GM Bot attivo",
  "servers": 1,
  "uptime": "2h 15m",
  "current_time_utc": "2025-09-29T10:30:00.000Z",
  "gm_status": "🔓 APERTO"
}
```

## 🔧 Architettura

- **Discord.js v14**: Libreria Discord
- **HTTP Keep-Alive**: Previene sleep mode su hosting gratuiti
- **Timer automatici**: Gestione orari senza cron
- **Gestione graceful shutdown**: Riconnessione automatica
- **Multi-server ready**: Funziona su infiniti server simultaneamente

## 📈 Performance

- **RAM**: ~100-200 MB
- **CPU**: <0.1 vCPU in idle
- **Network**: Minimo (solo comandi Discord)
- **Startup**: <5 secondi

## 🛠️ Sviluppo

```bash
# Avvio locale
npm start

# Debugging
node --trace-warnings bot.js
```

### Struttura File:
```
gmBot/
├── bot.js          # Codice principale
├── package.json    # Dipendenze
├── .env           # Token (non committare!)
└── README.md      # Documentazione
```

## 🤝 Contributi

Pull request benvenute! Per modifiche importanti, apri prima una issue.

## 📝 License

MIT

## 🔗 Links

- [Documentazione Discord.js](https://discord.js.org)
- [Railway Docs](https://docs.railway.app)
- [Discord Developer Portal](https://discord.com/developers/applications)
