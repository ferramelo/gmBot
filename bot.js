const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

// ID del canale GM
const GM_CHANNEL_ID = process.env.GM_CHANNEL_ID;

// Crea il client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Controlla se è orario GM attivo (07:00-12:00 UTC)
function isActiveTime() {
    const hour = new Date().getUTCHours();
    return hour >= 7 && hour < 12;
}

// Modifica permessi canale (solo invio messaggi)
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

// Quando il bot è pronto
client.once('ready', async () => {
    console.log(`✅ Bot avviato come ${client.user.tag}`);

    // Aggiorna permessi GM appena parte il bot
    for (const guild of client.guilds.cache.values()) {
        await toggleChannelPermissions(guild, isActiveTime());
    }

    // Aggiorna permessi ogni minuto
    setInterval(async () => {
        const active = isActiveTime();
        for (const guild of client.guilds.cache.values()) {
            await toggleChannelPermissions(guild, active);
        }
    }, 60 * 1000);
});

// Gestione messaggi
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== GM_CHANNEL_ID) return;

    // Messaggio fuori orario: cancellato + avviso
    if (!isActiveTime()) {
        await message.delete().catch(() => {});
        const warning = await message.channel.send(
            `⏰ ${message.author}, il canale GM è attivo solo dalle **07:00 alle 12:00 UTC**! Torna domani ☕`
        );
        setTimeout(() => warning.delete().catch(() => {}), 10000);
        console.log(`🚫 Messaggio fuori orario cancellato da ${message.author.username}`);
        return;
    }

    // Solo "gm" permesso
    if (message.content.toLowerCase().trim() !== 'gm') {
        await message.delete().catch(() => {});
        const info = await message.channel.send(
            `💬 ${message.author}, puoi scrivere solo "gm"!`
        );
        setTimeout(() => info.delete().catch(() => {}), 5000);
        console.log(`🗑️ Messaggio non valido cancellato da ${message.author.username}: "${message.content}"`);
        return;
    }

    // Messaggio valido
    await message.react('☕').catch(() => {});
    console.log(`☕ GM ricevuto da ${message.author.username}`);
});

// Login
client.login(process.env.DISCORD_TOKEN);

