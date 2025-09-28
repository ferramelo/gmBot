const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
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

// Blocca o sblocca canale
async function toggleChannelPermissions(guild, block = true) {
    try {
        const gmChannel = guild.channels.cache.get(GM_CHANNEL_ID);
        if (!gmChannel) return console.log('⚠️ Canale GM non trovato');

        await gmChannel.permissionOverwrites.edit(guild.roles.everyone, {
            [PermissionFlagsBits.SendMessages]: !block
        });

        console.log(block
            ? `🔒 Canale GM BLOCCATO`
            : `🔓 Canale GM SBLOCCATO`
        );
    } catch (err) {
        console.error('❌ Errore nel modificare i permessi:', err);
    }
}

// Ready
client.once('ready', async () => {
    console.log(`✅ Bot avviato come ${client.user.tag}`);

    for (const guild of client.guilds.cache.values()) {
        // Blocca o sblocca in base all'orario attuale
        await toggleChannelPermissions(guild, !isActiveTime());
    }
});

// Gestione messaggi
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== GM_CHANNEL_ID) return;

    if (!isActiveTime()) {
        await message.delete().catch(() => {});
        const warning = await message.channel.send(
            `⏰ ${message.author}, il canale GM è attivo solo dalle 07:00 alle 13:00 UTC!`
        );
        setTimeout(() => warning.delete().catch(() => {}), 10000);
        return;
    }

    if (message.content.toLowerCase().trim() === 'gm') {
        await message.react('☕').catch(() => {});
    } else {
        await message.delete().catch(() => {});
        const info = await message.channel.send(
            `💬 ${message.author}, puoi scrivere solo "gm"!`
        );
        setTimeout(() => info.delete().catch(() => {}), 5000);
    }
});

// Login
client.login(process.env.DISCORD_TOKEN);
