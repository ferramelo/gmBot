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

// Quando il bot è pronto
client.once('ready', () => {
    console.log(`✅ Bot avviato come ${client.user.tag}`);
});

// Gestione messaggi
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== GM_CHANNEL_ID) return;

    // FUORI ORARIO
    if (!isActiveTime()) {
        await message.delete().catch(() => {});
        const warning = await message.channel.send(
            `⏰ ${message.author}, il canale GM è attivo solo dalle **07:00 alle 13:00 UTC**! Torna domani mattina ☕`
        );
        setTimeout(() => warning.delete().catch(() => {}), 10000); // cancella avviso dopo 10s
        console.log(`🚫 Messaggio fuori orario cancellato da ${message.author.username}`);
        return;
    }

    // IN ORARIO ATTIVO
    if (message.content.toLowerCase().trim() !== 'gm') {
        await message.delete().catch(() => {});
        const info = await message.channel.send(
            `💬 ${message.author}, puoi scrivere solo "gm"!`
        );
        setTimeout(() => info.delete().catch(() => {}), 5000); // cancella avviso dopo 5s
        console.log(`🗑️ Messaggio non valido cancellato da ${message.author.username}: "${message.content}"`);
        return;
    }

    // Messaggio valido "gm"
    await message.react('☕').catch(() => {});
    console.log(`☕ GM ricevuto da ${message.author.username}`);
});

// Login
client.login(process.env.DISCORD_TOKEN);

