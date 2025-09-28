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

// Modifica permessi del canale (solo invio messaggi)
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

// Gestione messaggi
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== GM_CHANNEL_ID) return;

    // Cancella qualsiasi messaggio che non sia "gm"
    if (message.content.toLowerCase().trim() !== 'gm') {
        await message.delete().catch(() => {});
        const info = await message.channel.send(
            `💬 ${message.author}, puoi scrivere solo "gm"!`
        );
        setTimeout(() => info.delete().catch(() => {}), 5000);
        return;
    }

    // Reagisci ai messaggi validi "gm"
    await message.react('☕').catch(() => {});
    console.log(`☕ GM ricevuto da ${message.author.username}`);
});

// Login
client.login(process.env.DISCORD_TOKEN);

