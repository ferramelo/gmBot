const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

const GM_CHANNEL_ID = "1172876256547721262";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Orario GM attivo
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
  for (const guild of client.guilds.cache.values()) {
    await toggleChannelPermissions(guild, isActiveTime());
  }
});

// Gestione messaggi
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== GM_CHANNEL_ID) return;

  // Fuori orario
  if (!isActiveTime()) {
    await message.delete().catch(() => {});
    const warning = await message.channel.send(
      `⏰ ${message.author}, ci vediamo domani mattina alle 07 ☕`
    );
    setTimeout(() => warning.delete().catch(() => {}), 10000);
    return;
  }

  // Solo "gm"
  if (message.content.toLowerCase().trim() !== 'gm') {
    await message.delete().catch(() => {});
    const info = await message.channel.send(
      `💬 ${message.author}, puoi scrivere solo "gm"!`
    );
    setTimeout(() => info.delete().catch(() => {}), 5000);
    return;
  }

  // Messaggio valido
  await message.react('☕').catch(() => {});
});

client.login(process.env.DISCORD_TOKEN);

