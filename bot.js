const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// ID del canale GM
const GM_CHANNEL_ID = "1172876256547721262";

// Crea il client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Controlla se è orario attivo (07:00-13:00 UTC)
function isActiveTime() {
    const hour = new Date().getUTCHours();
    return hour >= 7 && hour < 13;
}

// Funzione per log dello stato del canale
function logChannelStatus() {
    console.log(isActiveTime()
        ? `🔓 Canale GM aperto - solo "gm" permesso`
        : `🌙 Canale GM in orario fuori attivo - messaggi non "gm" verranno cancellati`
    );
}

// Evento ready
client.once('ready', () => {
    console.log(`✅ Bot avviato come ${client.user.tag}`);
    logChannelStatus();
});

// Gestione messaggi
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== GM_CHANNEL_ID) return;

    const active = isActiveTime();
    const content = message.content.toLowerCase().trim();

    if (!active || content !== 'gm') {
        // Cancella messaggi non validi
        await message.delete().catch(() => {});
        const infoMsg = await message.channel.send(
            !active
                ? `⏰ ${message.author}, il canale GM è attivo solo dalle 07:00 alle 13:00 UTC!`
                : `💬 ${message.author}, puoi scrivere solo "gm"!`
        );
        setTimeout(() => infoMsg.delete().catch(() => {}), !active ? 10000 : 5000);
        return;
    }

    // Messaggio valido in orario
    await message.react('☕').catch(() => {});
});

// Login
client.login(process.env.DISCORD_TOKEN);

// Uscita pulita
process.on('SIGINT', () => {
    console.log('🛑 Chiusura bot...');
    client.destroy();
    process.exit(0);
});
