const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

// ID del canale GM
const GM_CHANNEL_ID = "1172876256547721262";

// Crea il client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // Assicurati che l'intent sia abilitato nel Developer Portal
    ]
});

// Controlla se è orario attivo (07:00-13:00 UTC)
function isActiveTime() {
    const hour = new Date().getUTCHours();
    return hour >= 7 && hour < 13;
}

// Modifica permessi del canale
async function toggleChannelPermissions(guild, allow = true) {
    try {
        const gmChannel = guild.channels.cache.get(GM_CHANNEL_ID);
        if (!gmChannel) return console.log('⚠️ Canale GM non trovato');

        await gmChannel.permissionOverwrites.edit(guild.roles.everyone, {
            [PermissionFlagsBits.SendMessages]: allow
        });

        console.log(allow
            ? `🔓 Canale GM SBLOCCATO`
            : `🔒 Canale GM BLOCCATO`
        );
    } catch (err) {
        console.error('❌ Errore nel modificare i permessi:', err);
    }
}

// Evento clientReady (sostituisce ready)
client.once('clientReady', async () => {
    console.log(`✅ Bot avviato come ${client.user.tag}`);

    for (const guild of client.guilds.cache.values()) {
        await toggleChannelPermissions(guild, isActiveTime());
    }

    // Controlla ogni minuto se cambiare stato del canale
    setInterval(async () => {
        const allow = isActiveTime();
        for (const guild of client.guilds.cache.values()) {
            await toggleChannelPermissions(guild, allow);
        }
    }, 60 * 1000);
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

