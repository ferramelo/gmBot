const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');

// ID del canale GM
const GM_CHANNEL_ID = "1172876256547721262";

// Crea una nuova istanza del client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Orari attivi: 07:00 - 13:00 (UTC)
function isActiveTime() {
    const now = new Date();
    const hour = now.getUTCHours(); // UTC per coerenza con Railway
    return hour >= 7 && hour < 13;
}

// Blocca/sblocca canale GM
async function toggleChannelPermissions(guild, block = true) {
    try {
        const gmChannel = guild.channels.cache.get(GM_CHANNEL_ID);

        if (!gmChannel) {
            console.log('⚠️ Canale GM non trovato');
            return;
        }

        const everyoneRole = guild.roles.everyone;

        await gmChannel.permissionOverwrites.edit(everyoneRole, {
            [PermissionFlagsBits.SendMessages]: block ? false : true
        });

        console.log(block
            ? `🔒 Canale GM BLOCCATO`
            : `🔓 Canale GM SBLOCCATO`
        );

    } catch (error) {
        console.error('❌ Errore nel modificare i permessi:', error);
    }
}

// Quando il bot si connette
client.once('ready', async () => {
    console.log(`✅ Bot moderatore avviato come ${client.user.tag}`);
    console.log('📅 Regole: 07:00-13:00 UTC aperto, 13:00-07:00 UTC chiuso');

    for (const guild of client.guilds.cache.values()) {
        await toggleChannelPermissions(guild, !isActiveTime());
    }

    // Controlla ogni minuto lo stato
    setInterval(async () => {
        const active = isActiveTime();
        for (const guild of client.guilds.cache.values()) {
            await toggleChannelPermissions(guild, !active);
        }
    }, 60 * 1000);
});

// Gestione messaggi
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== GM_CHANNEL_ID) return;

    const active = isActiveTime();

    if (!active) {
        try {
            await message.delete();
            const warningMsg = await message.channel.send(
                `⏰ ${message.author}, il canale GM è attivo solo dalle **07:00 alle 13:00 UTC**!\n` +
                `Riprova domani mattina ☕`
            );
            setTimeout(() => warningMsg.delete().catch(() => {}), 10000);
            console.log(`🚫 Messaggio fuori orario cancellato da ${message.author.username}`);
        } catch (err) {
            console.error('Errore nel cancellare messaggio fuori orario:', err);
        }
        return;
    }

    const content = message.content.toLowerCase().trim();

    if (content === 'gm') {
        try {
            await message.react('☕');
            console.log(`☕ GM ricevuto da ${message.author.username}`);
        } catch (err) {
            console.error('Errore nel reagire al messaggio:', err);
        }
    } else {
        try {
            await message.delete();
            const infoMsg = await message.channel.send(
                `💬 ${message.author}, in questo canale puoi scrivere solo "gm"!`
            );
            setTimeout(() => infoMsg.delete().catch(() => {}), 5000);
            console.log(`🗑️ Messaggio non valido cancellato da ${message.author.username}: "${message.content}"`);
        } catch (err) {
            console.error('Errore nel gestire messaggio non valido:', err);
        }
    }
});

// Error handling
client.on('error', err => console.error('⚠️ Errore client Discord:', err));

// Login
console.log('🚀 Avvio bot moderatore...');
client.login(process.env.DISCORD_TOKEN);

// Uscita pulita
process.on('SIGINT', () => {
    console.log('🛑 Chiusura bot...');
    client.destroy();
    process.exit(0);
});

