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

// Controlla e modifica i permessi del canale GM (solo scrittura)
async function toggleChannelPermissions(guild, allowSend = true) {
    try {
        const gmChannel = guild.channels.cache.get(GM_CHANNEL_ID);
        if (!gmChannel) return console.log('⚠️ Canale GM non trovato');

        await gmChannel.permissionOverwrites.edit(guild.roles.everyone, {
            [PermissionFlagsBits.SendMessages]: allowSend
        });

        console.log(allowSend
            ? `🔓 Canale GM SBLOCCATO`
            : `🔒 Canale GM LIMITATO`
        );
    } catch (err) {
        console.error('❌ Errore nel modificare i permessi:', err);
    }
}

// Evento ready
client.once('ready', async () => {
    console.log(`✅ Bot avviato come ${client.user.tag}`);

    // Aggiorna lo stato del canale all'avvio
    for (const guild of client.guilds.cache.values()) {
        await toggleChannelPermissions(guild, isActiveTime());
    }

    // Controlla ogni minuto lo stato del canale
    setInterval(async () => {
        const active = isActiveTime();
        for (const guild of client.guilds.cache.values()) {
            await toggleChannelPermissions(guild, active);
        }
    }, 60 * 1000);
});

// Gestione dei messaggi
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== GM_CHANNEL_ID) return;

    const active = isActiveTime();

    // Fuori orario: cancella messaggi + avviso
    if (!active) {
        await message.delete().catch(() => {});
        const warning = await message.channel.send(
            `⏰ ${message.author}, il canale GM è attivo solo dalle **07:00 alle 13:00 UTC**! Torna domani mattina ☕`
        );
        setTimeout(() => warning.delete().catch(() => {}), 10000);
        console.log(`🚫 Messaggio fuori orario cancellato da ${message.author.username}`);
        return;
    }

    // In orario: cancella tutto ciò che non è "gm" + avviso
    if (message.content.toLowerCase().trim() !== 'gm') {
        await message.delete().catch(() => {});
        const info = await message.channel.send(
            `💬 ${message.author}, puoi scrivere solo "gm"!`
        );
        setTimeout(() => info.delete().catch(() => {}), 5000);
        console.log(`🗑️ Messaggio non valido cancellato da ${message.author.username}: "${message.content}"`);
        return;
    }

    // Messaggio valido "gm"
    await message.react('☕').catch(() => {});
    console.log(`☕ GM ricevuto da ${message.author.username}`);
});

// Login
client.login(process.env.DISCORD_TOKEN);

