# 🚀 Deploy Bot Discord su Railway (Con Orario 07:00-12:00)

## Preparazione del progetto

### 1. Crea i file necessari
Crea una cartella per il progetto con questi file:

**📁 Struttura cartella:**
```
gm-bot/
├── bot.js                 (il codice del bot con orario)
├── .env.example          (esempio variabili)
└──  package.json          (configurazione npm)

```

### 2. Crea `package.json`
```json
{
  "name": "gmBot",
  "version": "1.0.0",
  "description": "Bot Discord per GM",
  "main": "bot.js",
  "scripts": {
    "start": "node bot.js"
  },
  "engines": {
    "node": ">=20.x"
  },
  "dependencies": {
    "discord.js": "^14.14.1",
    "dotenv": "^16.3.1"
  }
}
```

## 🛡️ Come funziona il sistema completo

### 🕐 **Orario ATTIVO (07:00-12:00):**
- ✅ Canale #gm - tutti possono scrivere
- ✅ Bot risponde a "gm" con ☕
- 🗑️ Bot cancella messaggi diversi da "gm" (con avviso gentile)

### 🌙 **Orario INATTIVO (12:00-07:00):**  
- 🔒 Canale #gm - nessuno può scrivere
- 🚫 Canale **Bloccato**
- ⏰ Bot invia avviso: "Torna domani mattina per dire gm!"

### 📊 **Calcolo ore Railway:**
- Bot attivo 24/7 ma consuma poche risorse
- ~**50-100 ore/mese** (molto meno del limite 500!)

## Deploy su Railway

### Step 1-3: Come nella guida normale
(GitHub upload, Railway connection, variables setup)

### Step 4: Configurazione orario
Nel Railway dashboard, aggiungi anche:
- **Nome**: `TZ`
- **Valore**: `Europe/Rome` (o il tuo fuso orario)

## ⚙️ Come configurare su Railway Free:

### Serverless
- Abilita Serverless → così il container dorme quando non ci sono richieste.
- Start Command: `node bot.js`
- Restart Policy: non serve, il bot si riattiva automaticamente quando arriva un messaggio.
  
  Con questa configurazione:
- Il bot usa pochissime ore perché è inattivo quando nessuno scrive.
- Il canale GM rimane bloccato fuori orario.
- Ricevi avvisi se qualcuno scrive qualcosa di diverso da "gm".


## 🔧 Gestione manuale

### Riavviare manualmente:
- Dashboard Railway → "Restart"
- Oppure push su GitHub per trigger deploy

### Controllare orario attivo:
Nei log vedrai:
```
Avvio del bot in orario attivo...
Bot connesso come NomeBot#1234!
Orario attivo: 07:00-12:00
```

O se fuori orario:
```
Fuori orario (07:00-12:00) - bot non avviato
```

## ✅ Verifica che funzioni

### Controlla i log:
Dovresti vedere:
```
Bot connesso come NomeBot#1234!
Il bot permetterà solo "gm" nel canale #gm, cancellando tutto il resto
```

### Testa il bot:
1. Vai nel canale #gm del tuo Discord
2. Scrivi "gm"
3. Dovresti vedere la reazione ☕
4. Prova a scrivere altro → dovrebbe essere cancellato

## 🔧 Gestione

### Riavviare il bot:
- Nel dashboard Railway, clicca "Restart"

### Aggiornare il codice:
1. Modifica i file su GitHub
2. Railway rileverà automaticamente i cambi
3. Rideploy automatico

### Monitorare:
- **Logs**: vedi tutti i log in tempo reale
- **Metrics**: uso CPU, memoria, traffico
- **Deployments**: storico dei deploy

## 💰 Limiti gratuiti Railway
- **500 ore/mese** di uptime
- **100GB** di traffico in uscita
- **1GB** RAM
- **1GB** storage

## 🚨 Troubleshooting

### Bot non si connette:
- Controlla che `DISCORD_TOKEN` sia impostato correttamente
- Verifica nei log se ci sono errori

### Bot non risponde:
- Assicurati che il canale si chiami esattamente "gm"
- Controlla i permessi del bot nel server Discord
- Metti il tuo id del canale #gm 

### Superi le 500 ore:
- Upgrading a Railway Pro ($5/mese) per uptime illimitato
- Oppure gestisci manualmente quando è attivo

## 🎯 Pro Tips
- Usa `railway logs` nella CLI per vedere i log dal terminale
- Imposta notifiche per quando il bot va offline
- Fai backup regolari del codice su GitHub
