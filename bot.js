const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');

// Crea una nuova istanza del client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Funzione per controllare se è orario attivo (07:00-13:00)
function isActiveTime() {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 7 && hour < 13;
}

// Funzione per bloccare/sbloccare il canale
async function toggleChannelPermissions(guild, block = true) {
    try {
        // Trova il canale #gm
        const gmChannel = guild.channels.cache.find(channel => 
            channel.name === 'gm' && channel.type === 0 // Text channel
        );
        
        if (!gmChannel) {
            console.log('Canale #gm non trovato');
            return;
        }

        // Ottieni il ruolo @everyone
        const everyoneRole = guild.roles.everyone;

        if (block) {
            // BLOCCA: Rimuovi permesso di scrivere
            await gmChannel.permissionOverwrites.edit(everyoneRole, {
                [PermissionFlagsBits.SendMessages]: false
            });
            console.log('🔒 Canale #gm BLOCCATO - nessuno può scrivere');
        } else {
            // SBLOCCA: Ripristina permesso di scrivere
            await gmChannel.permissionOverwrites.edit(everyoneRole, {
                [PermissionFlagsBits.SendMessages]: true
            });
            console.log('🔓 Canale #gm SBLOCCATO - si può scrivere normalmente');
        }
    } catch (error) {
        console.error('Errore nel modificare i permessi del canale:', error);
    }
}

// Evento quando il bot è pronto
client.once('ready', async () => {
    console.log(`Bot moderatore connesso come ${client.user.tag}!`);
    console.log('Gestisce canale #gm: 07:00-13:00 sbloccato, 13:00-07:00 bloccato');
    
    // Controlla stato iniziale
    for (const guild of client.guilds.cache.values()) {
        const shouldBeActive = isActiveTime();
        await toggleChannelPermissions(guild, !shouldBeActive);
        
        if (shouldBeActive) {
            console.log('🌅 Orario attivo - canale aperto per GM');
        } else {
            console.log('🌙 Fuori orario - canale bloccato');
        }
    }
    
    // Controlla ogni 30 minuti per cambio stato
    setInterval(async () => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        
        // Alle 07:00 sblocca, alle 13:00 blocca
        if ((hour === 7 && minute === 0) || (hour === 13 && minute === 0)) {
            const shouldBlock = hour === 13;
            
            for (const guild of client.guilds.cache.values()) {
                await toggleChannelPermissions(guild, shouldBlock);
            }
        }
    }, 60000); // Controlla ogni minuto
});

// Evento per i messaggi
client.on('messageCreate', async (message) => {
    // Ignora i messaggi del bot stesso
    if (message.author.bot) return;
    
    // Solo nel canale #gm
    if (message.channel.name !== 'gm') return;
    
    const currentTime = isActiveTime();
    
    if (!currentTime) {
        // FUORI ORARIO: cancella qualsiasi messaggio e avvisa
        try {
            await message.delete();
            
            // Invia messaggio temporaneo di avviso
            const warningMsg = await message.channel.send(
                `⏰ ${message.author}, il canale #gm è attivo solo dalle **07:00 alle 13:00**!\n` +
                `Torna domani mattina per dire "gm" ☕`
            );
            
            // Cancella l'avviso dopo 10 secondi
            setTimeout(async () => {
                try {
                    await warningMsg.delete();
                } catch (err) {
                    console.log('Messaggio di avviso già cancellato');
                }
            }, 10000);
            
            console.log(`🚫 Messaggio fuori orario cancellato da ${message.author.username}`);
            
        } catch (error) {
            console.error('Errore nel gestire messaggio fuori orario:', error);
        }
        return;
    }
    
    // ORARIO ATTIVO: logica normale del bot GM
    const content = message.content.toLowerCase().trim();
    
    if (content === 'gm') {
        try {
            // Risponde con emoji del caffè
            await message.react('☕');
            console.log(`☕ GM ricevuto da ${message.author.username}`);
            
        } catch (error) {
            console.error('Errore nell\'inviare la reazione:', error);
        }
    } else {
        try {
            // Cancella messaggi che non sono "gm" anche in orario attivo
            await message.delete();
            
            // Messaggio di avviso più gentile durante orario attivo
            const infoMsg = await message.channel.send(
                `💬 ${message.author}, in questo canale puoi scrivere solo "gm"!`
            );
            
            // Cancella dopo 5 secondi
            setTimeout(async () => {
                try {
                    await infoMsg.delete();
                } catch (err) {
                    console.log('Messaggio info già cancellato');
                }
            }, 5000);
            
            console.log(`🗑️ Messaggio non-GM cancellato da ${message.author.username}: "${message.content}"`);
            
        } catch (error) {
            console.error('Errore nel cancellare il messaggio:', error);
        }
    }
});

// Gestione errori
client.on('error', error => {
    console.error('Errore del client Discord:', error);
});

// Login del bot
console.log('🚀 Avvio bot moderatore canale GM...');
client.login(process.env.DISCORD_TOKEN);

// Gestione chiusura graceful
process.on('SIGINT', () => {
    console.log('Chiusura del bot...');
    client.destroy();
    process.exit(0);
});
