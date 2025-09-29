const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

const GM_CHANNEL_ID = "1172876256547721262"; // <--- Metti id del tuo canale #gm

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Orario GM attivo (7:00 - 12:00 UTC)
function isActiveTime() {
  const hour = new Date().getUTCHours();
  return hour >= 7 && hour < 12;
}

// Modifica permessi canale con migliore gestione errori
async function toggleChannelPermissions(guild, allowSend = true) {
  try {
    const gmChannel = guild.channels.cache.get(GM_CHANNEL_ID);
    if (!gmChannel) {
      console.log(`⚠️ Canale GM non trovato nel server: ${guild.name}`);
      return;
    }
    
    await gmChannel.permissionOverwrites.edit(guild.roles.everyone, {
      [PermissionFlagsBits.SendMessages]: allowSend
    });
    
    console.log(`✅ Permessi aggiornati per ${guild.name}: ${allowSend ? 'APERTO' : 'CHIUSO'}`);
  } catch (err) {
    console.error(`❌ Errore permessi per ${guild.name}:`, err.message);
  }
}

// Gestione graceful shutdown con delay
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM ricevuto, tento di rimanere attivo...');
  
  // Prova a rimanere attivo per un po'
  setTimeout(() => {
    console.log('⏰ Timeout raggiunto, chiudo il bot...');
    client.destroy();
    process.exit(0);
  }, 30000); // 30 secondi di grazia
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT ricevuto, chiusura bot...');
  client.destroy();
  process.exit(0);
});

// Gestione errori non gestiti
process.on('unhandledRejection', (error) => {
  console.error('❌ Errore non gestito:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Eccezione non gestita:', error);
  process.exit(1);
});

// Bot pronto - usando clientReady per evitare deprecation
client.once('clientReady', async () => {
      console.log(`✅ Bot avviato come ${client.user.tag}`);
  console.log(`📊 Bot connesso a ${client.guilds.cache.size} server(s)`);
  console.log(`🚄 Railway Deploy ID: ${process.env.RAILWAY_DEPLOYMENT_ID || 'local'}`);
  console.log(`🌐 Railway Service: ${process.env.RAILWAY_SERVICE_NAME || 'gmbot'}`);
  
  // Imposta permessi iniziali per tutti i server
  const isActive = isActiveTime();
  console.log(`⏰ Orario corrente UTC: ${new Date().getUTCHours()}:${new Date().getUTCMinutes().toString().padStart(2, '0')}`);
  console.log(`📡 Stato canale GM: ${isActive ? 'APERTO' : 'CHIUSO'}`);
  
  for (const guild of client.guilds.cache.values()) {
    await toggleChannelPermissions(guild, isActive);
    // Piccola pausa per evitare rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Timer per controllo automatico dei permessi ogni minuto
  const checkInterval = setInterval(async () => {
    try {
      const now = new Date();
      const hour = now.getUTCHours();
      const minute = now.getUTCMinutes();
      
      // Alle 7:00 UTC - sblocca canale e messaggio di apertura
      if (hour === 7 && minute === 0) {
        console.log('🌅 Apertura canale GM alle 7:00 UTC');
        for (const guild of client.guilds.cache.values()) {
          await toggleChannelPermissions(guild, true);
          
          const gmChannel = guild.channels.cache.get(GM_CHANNEL_ID);
          if (gmChannel) {
            try {
              await gmChannel.send("🌅 Buongiorno! Il canale GM è ora aperto. Scrivi 'gm' per salutare! ☕");
            } catch (err) {
              console.error(`❌ Errore invio messaggio apertura in ${guild.name}:`, err.message);
            }
          }
          
          // Pausa tra i server per evitare rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      // Alle 12:00 UTC - blocca canale e messaggio di chiusura
      if (hour === 12 && minute === 0) {
        console.log('🌙 Chiusura canale GM alle 12:00 UTC');
        for (const guild of client.guilds.cache.values()) {
          const gmChannel = guild.channels.cache.get(GM_CHANNEL_ID);
          if (gmChannel) {
            try {
              await gmChannel.send("🌙 Buon resto di giornata! Ci vediamo domani mattina alle 07:00 ☕");
            } catch (err) {
              console.error(`❌ Errore invio messaggio chiusura in ${guild.name}:`, err.message);
            }
          }
          
          await toggleChannelPermissions(guild, false);
          // Pausa tra i server
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    } catch (error) {
      console.error('❌ Errore nel timer di controllo:', error);
    }
  }, 60000); // Controlla ogni minuto
  
  // Pulisci l'intervallo quando il bot si disconnette
  client.on('disconnect', () => {
    clearInterval(checkInterval);
  });
});

// Gestione messaggi con migliore error handling
client.on('messageCreate', async (message) => {
  try {
    // Ignora messaggi dei bot
    if (message.author.bot) return;
    
    // Solo nel canale GM
    if (message.channel.id !== GM_CHANNEL_ID) return;
    
    // Verifica se il canale è attivo
    if (!isActiveTime()) {
      try {
        await message.delete();
      } catch (err) {
        console.error('❌ Errore eliminazione messaggio:', err.message);
      }
      return;
    }
    
    // Solo "gm" è permesso
    if (message.content.toLowerCase().trim() !== 'gm') {
      try {
        await message.delete();
        const info = await message.channel.send(
          `💬 ${message.author}, puoi scrivere solo "gm"!`
        );
        setTimeout(() => info.delete().catch(() => {}), 5000);
      } catch (err) {
        console.error('❌ Errore gestione messaggio non valido:', err.message);
      }
      return;
    }
    
    // Messaggio valido - aggiungi reazione
    try {
      await message.react('☕');
    } catch (err) {
      console.error('❌ Errore aggiunta reazione:', err.message);
    }
    
  } catch (error) {
    console.error('❌ Errore generale in messageCreate:', error);
  }
});

// Gestione errori di connessione
client.on('error', (error) => {
  console.error('❌ Errore Discord Client:', error);
});

client.on('warn', (warning) => {
  console.warn('⚠️ Warning Discord Client:', warning);
});

// Keep-alive per evitare che il container si fermi
function keepAlive() {
  setInterval(() => {
    console.log(`💓 Bot attivo - ${new Date().toISOString()}`);
    console.log(`📊 Memoria: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`);
    console.log(`⏰ Uptime: ${Math.round(process.uptime())} secondi`);
  }, 300000); // Log ogni 5 minuti
}

// Login del bot con migliore error handling
async function startBot() {
  try {
    if (!process.env.DISCORD_TOKEN) {
      throw new Error('DISCORD_TOKEN non trovato nel file .env');
    }
    
    await client.login(process.env.DISCORD_TOKEN);
    console.log('🚀 Login completato con successo');
    
    // Avvia keep-alive
    keepAlive();
    
    // Health check endpoint se disponibile
    if (process.env.PORT) {
      const http = require('http');
      const server = http.createServer((req, res) => {
        // Aggiungi headers CORS e cache
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache');
        
        if (req.url === '/health' || req.url === '/') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'healthy',
            bot: client.user?.tag || 'connecting',
            guilds: client.guilds.cache.size,
            uptime: Math.round(process.uptime()),
            memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            timestamp: new Date().toISOString()
          }));
        } else if (req.url === '/ping') {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('pong');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head><title>GM Bot Discord</title></head>
              <body>
                <h1>🤖 Bot Discord GM Attivo</h1>
                <p><strong>Bot:</strong> ${client.user?.tag || 'connecting'}</p>
                <p><strong>Server:</strong> ${client.guilds.cache.size}</p>
                <p><strong>Uptime:</strong> ${Math.round(process.uptime())} secondi</p>
                <p><strong>Status:</strong> ✅ Online</p>
              </body>
            </html>
          `);
        }
      });
      
      server.listen(process.env.PORT, '0.0.0.0', () => {
        console.log(`🌐 Health server avviato su 0.0.0.0:${process.env.PORT}`);
        
        // Mantieni il server attivo
        server.keepAliveTimeout = 120000; // 2 minuti
        server.headersTimeout = 120000;
      });
      
      // Gestione errori server
      server.on('error', (err) => {
        console.error('❌ Errore health server:', err);
      });
      
      // Richiesta automatica ogni 10 minuti per mantenere attivo
      setInterval(() => {
        const http = require('http');
        const options = {
          hostname: '0.0.0.0',
          port: process.env.PORT,
          path: '/ping',
          method: 'GET'
        };
        
        const req = http.request(options, (res) => {
          console.log(`💓 Self-ping: ${res.statusCode}`);
        });
        
        req.on('error', (err) => {
          console.log('⚠️ Self-ping error:', err.message);
        });
        
        req.end();
      }, 600000); // Ogni 10 minuti
    }
    
  } catch (error) {
    console.error('❌ Errore durante il login:', error);
    process.exit(1);
  }
}

startBot();
