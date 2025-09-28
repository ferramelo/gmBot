# gmBot-
#gm sarà un perfetto "orario d'ufficio" per i saluti mattutini su Discord! 🌅☕

# 🌅☕ GM Moderator Bot

Bot Discord che gestisce il canale #gm con orari programmati e moderazione automatica.

## 🚀 Funzionalità

### Orario Attivo (07:00-13:00)
- ✅ Canale #gm 
- ☕ Risponde a "gm" con emoji caffè  
- 🗑️ Cancella messaggi diversi da "gm"
- 💬 Avvisi gentili per messaggi non validi

### Orario Inattivo (13:00-07:00) 
- 🔒 Canale #gm 
- 🚫 Nessuno può scrivere
- ⏰ Avvisi "torna domani mattina"

## 📋 Requisiti

- Node.js 20+
- Bot Discord con permessi:
  - Read Messages/View Channels
  - Send Messages
  - Add Reactions  
  - Manage Messages
  - Manage Channels
  - Manage Roles

## ⚙️ Setup

1. Clona il repository
2. `npm install`
3. Crea file `.env`:
   ```
   DISCORD_TOKEN=il_tuo_token
   TZ=Europe/Rome
   ```
4. `npm start`

## 🚀 Deploy su Railway

1. Carica su GitHub
2. Connetti a Railway
3. Aggiungi variabili d'ambiente
4. Deploy automatico!

Vedi [guida completa](./DEPLOY.md) per dettagli.

## 📊 Statistiche

- **Consumo Railway**: ~50-100 ore/mese
- **Uptime**: 24/7 
- **Fuso orario**: Configurabile

## 🛠️ Sviluppo

- `npm start` - Avvia il bot
- Logs dettagliati per debugging
- Gestione errori robusta

## 📝 License

MIT
