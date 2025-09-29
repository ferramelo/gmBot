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

// Modifica permessi canale
async function toggleChannelPermissions(guild, allowSend = true) {
  try {
    const gmChannel = guild.channels.cache.get(GM_CHANNEL_ID);
    if (!gmChannel) return;
    
    await gmChannel.permissionOverwrites.edit(guild.roles.everyone, {
      [PermissionFlagsBits.SendMessages]: allowSend
    });
  } catch (err) {
    console.error('Errore permessi:', err);
  }
}

// Bot pronto
client.once('ready', async () => {
  console.log(`✅ Bot avviato come ${client.user.tag}`);
  
  // Imposta permessi iniziali per tutti i server
  for (const guild of client.guilds.cache.values()) {
    await toggleChannelPermissions(guild, isActiveTime());
  }
  
  // Timer per controllo automatico dei permessi ogni minuto
  setInterval(async () => {
    const now = new Date();
    const hour = now.getUTCHours();
    const minute = now.getUTCMinutes();
    
    // Alle 7:00 UTC - sblocca canale e messaggio di apertura
    if (hour === 7 && minute === 0) {
      for (const guild of client.guilds.cache.values()) {
        await toggleChannelPermissions(guild, true);
        const gmChannel = guild.channels.cache.get(GM_CHANNEL_ID);
        if (gmChannel) {
          await gmChannel.send("🌅 Buongiorno! Il canale GM è ora aperto. Scrivi 'gm' per salutare! ☕");
        }
      }
      console.log('🔓 Canale GM sbloccato alle 7:00 UTC');
    }
    
    // Alle 12:00 UTC - blocca canale e messaggio di chiusura
    if (hour === 12 && minute === 0) {
      for (const guild of client.guilds.cache.values()) {
        const gmChannel = guild.channels.cache.get(GM_CHANNEL_ID);
        if (gmChannel) {
          await gmChannel.send("🌅 Buon resto di giornata! Ci vediamo domani mattina alle 07:00 ☕");
        }
        await toggleChannelPermissions(guild, false);
      }
      console.log('🔒 Canale GM bloccato alle 12:00 UTC');
    }
  }, 60000); // Controlla ogni minuto
});

// Gestione messaggi
client.on('messageCreate', async (message) => {
  // Ignora messaggi dei bot
  if (message.author.bot) return;
  
  // Solo nel canale GM
  if (message.channel.id !== GM_CHANNEL_ID) return;
  
  // Solo "gm" è permesso
  if (message.content.toLowerCase().trim() !== 'gm') {
    await message.delete().catch(() => {});
    const info = await message.channel.send(
      `💬 ${message.author}, puoi scrivere solo "gm"!`
    );
    setTimeout(() => info.delete().catch(() => {}), 5000);
    return;
  }
  
  // Messaggio valido - aggiungi reazione
  await message.react('☕').catch(() => {});
});

// Login del bot
client.login(process.env.DISCORD_TOKEN);
