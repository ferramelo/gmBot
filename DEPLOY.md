# 🚀 Deploy GM Bot su Railway

Guida completa per il deploy del bot Discord su Railway con gestione automatica orari 7:00-12:00 UTC.

## 📋 Prerequisiti

- Account GitHub
- Account Railway (gratuito)
- Bot Discord configurato nel [Developer Portal](https://discord.com/developers/applications)
- Token del bot

## 🛠️ Preparazione Progetto

### Struttura File

```
gmBot/
├── bot.js              # Codice principale del bot
├── package.json        # Dipendenze Node.js
├── .env                # Template variabili d'ambiente
├── DEPLOY.md           # File da escludere
├── .node-version       # Node version
└── README.md           # Documentazione
```

### File `.env`

```env
DISCORD_TOKEN=your_discord_token_here
```

## 🚀 Deploy su Railway

### 1. Prepara il Repository GitHub

```bash
# Inizializza Git (se non già fatto)
git init

# Aggiungi tutti i file
git add .

# Commit iniziale
git commit -m "Initial commit: GM Bot"

# Collega a GitHub
git remote add origin https://github.com/tuousername/gmBot.git
git branch -M main
git push -u origin main
```

### 2. Setup Railway

1. Vai su [railway.app](https://railway.app)
2. Fai login con GitHub
3. Click su **"New Project"**
4. Seleziona **"Deploy from GitHub repo"**
5. Autorizza Railway ad accedere al tuo repository
6. Seleziona il repository `gmBot`

### 3. Configurazione Variabili d'Ambiente

Nel dashboard Railway:

1. Vai su **"Variables"**
2. Aggiungi la variabile:
   - **Key**: `DISCORD_TOKEN`
   - **Value**: Il tuo token Discord
3. Click su **"Add"**

Railway rileverà automaticamente `package.json` e installerà le dipendenze.

### 4. Generare Dominio Pubblico (Opzionale)

Per il monitoring HTTP:

1. Vai su **"Settings"** → **"Networking"**
2. Click su **"Generate Domain"**
3. Salva l'URL generato (es: `gmbot-production-xxxx.up.railway.app`)

Visitando l'URL vedrai lo stato del bot in JSON:

```json
{
  "status": "✅ GM Bot attivo",
  "servers": 1,
  "uptime": "2h 30m",
  "current_time_utc": "2025-09-29T10:00:00.000Z",
  "gm_status": "🔓 APERTO"
}
```

## ⚙️ Configurazione Discord

### Setup Server Discord

1. Crea un canale testuale chiamato esattamente **"gm"** (minuscolo)
2. Il bot gestirà automaticamente i permessi

### Permessi Bot Necessari

Quando crei l'invite link nel Developer Portal, seleziona:

- ✅ Manage Channels
- ✅ Manage Messages
- ✅ Read Messages/View Channels
- ✅ Send Messages
- ✅ Add Reactions

**URL Invite esempio:**
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=268454928&scope=bot
```

## 🕐 Funzionamento Orari

### Orario Attivo (7:00-12:00 UTC)

**Equivalenze fuso italiano:**
- Estate (UTC+2): 09:00-14:00
- Inverno (UTC+1): 08:00-13:00

**Comportamento:**
- Canale sbloccato automaticamente
- Messaggio di benvenuto: "🌅 Buongiorno! Il canale GM è ora aperto. Scrivi 'gm' per salutare! ☕"
- Accetta solo messaggi "gm"
- Reazione automatica ☕
- Cancella messaggi non validi con avviso temporaneo

### Orario Inattivo (12:00-7:00 UTC)

**Comportamento:**
- Messaggio di chiusura: "🌅 Buon resto di giornata! Ci vediamo domani mattina alle 07:00 ☕"
- Canale bloccato (permessi scrittura rimossi)
- Nessuno può inviare messaggi

## 📊 Monitoraggio

### Log Railway

Visualizza log in tempo reale:
```
Railway Dashboard → Deployments → Latest → Logs
```

Log tipici del bot:
```
🌐 Keep-alive server avviato su porta 8080
✅ Bot avviato come gmBot#2557
📊 Bot connesso a 1 server(s)
🔓 Canale GM sbloccato alle 7:00 UTC
```

### Railway CLI (Opzionale)

Installa CLI per accesso veloce:
```bash
npm install -g @railway/cli
railway login
railway logs
```

## 💰 Limiti Piano Gratuito

**Railway Free Tier:**
- 500 ore/mese di runtime
- $5 di credito/mese
- 1 GB RAM
- 1 GB storage

**Consumo stimato bot GM:**
- ~50-100 MB RAM
- <0.1 vCPU
- Traffico minimo

Il bot può funzionare 24/7 nel piano gratuito senza problemi.

## 🔧 Manutenzione

### Aggiornare il Bot

```bash
# Modifica il codice localmente
git add .
git commit -m "Update: descrizione modifiche"
git push

# Railway rideploya automaticamente
```

### Riavvio Manuale

Railway Dashboard → **"Restart"**

### Visualizzare Metriche

Dashboard mostra:
- CPU usage
- Memory usage
- Network egress
- Deployment history

## 🚨 Troubleshooting

### Bot non si avvia

**Controlla:**
1. `DISCORD_TOKEN` impostato correttamente
2. Token valido nel Developer Portal
3. Log Railway per errori specifici

**Errori comuni:**
```
Error: Cannot find module 'discord.js'
→ Verifica package.json, redeploy

Invalid token
→ Rigenera token nel Developer Portal
```

### Bot non risponde ai comandi

**Verifica:**
1. Canale si chiama esattamente "gm" (minuscolo)
2. Bot ha permessi necessari
3. Bot è online (check presenza Discord)

### Restart frequenti

**Normale per piano gratuito:**
- Railway può fare sleep/restart
- Bot si riconnette automaticamente
- Nessun impatto sulla funzionalità

**Per eliminare restart:**
- Upgrade a Railway Pro ($5/mese)

### Superamento limite ore

**Soluzioni:**
1. Upgrade a Railway Pro (uptime illimitato)
2. Monitora uso nel dashboard
3. Considera alternative (Render, Fly.io)

## 🔐 Sicurezza

### Best Practices

- Non committare mai `.env` con token
- Rigenera token se compromesso
- Mantieni dipendenze aggiornate

### Rotazione Token

Se il token viene esposto:
1. Developer Portal → Bot → Reset Token
2. Aggiorna variabile su Railway
3. Redeploy automatico

## 📈 Ottimizzazioni

### Performance

Il bot è già ottimizzato con:
- HTTP keep-alive nativo
- Gestione graceful shutdown
- Timer efficienti
- Cache Discord.js

### Scaling

Per gestire molti server:
- Memory e CPU scalano automaticamente
- Keep-alive previene sleep mode
- Multi-server nativo

## 🎯 Checklist Deploy

- [ ] Repository GitHub creato e pushato
- [ ] Progetto Railway collegato
- [ ] Variabile `DISCORD_TOKEN` impostata
- [ ] Build completato con successo
- [ ] Bot online su Discord
- [ ] Canale #gm creato nel server
- [ ] Test messaggio "gm" funzionante
- [ ] Reazione ☕ ricevuta
- [ ] Dominio pubblico generato (opzionale)
- [ ] URL monitoring salvato

## 🔗 Risorse Utili

- [Railway Docs](https://docs.railway.app)
- [Discord.js Guide](https://discordjs.guide)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Node.js Docs](https://nodejs.org/docs)

## 💡 Tips Avanzati

### Multi-Environment

Crea branch separati per testing:
```bash
git checkout -b development
# Railway può deployare da branch specifici
```

### Monitoring Esterno

Usa servizi come UptimeRobot per pingare l'endpoint HTTP ogni 5 minuti.

### Backup

Railway mantiene storico deploy - puoi fare rollback a versioni precedenti dal dashboard.

---

**Supporto:** Per problemi, apri una issue su GitHub o consulta i log Railway.
