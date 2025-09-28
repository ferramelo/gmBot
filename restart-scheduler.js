// restart-scheduler.js
// Script separato per riavviare il bot ogni mattina alle 07:00

const https = require('https');

// URL del webhook Railway per riavviare il servizio
// Sostituisci con il tuo webhook URL da Railway
const RAILWAY_WEBHOOK_URL = process.env.RAILWAY_WEBHOOK_URL;

function restartBot() {
    if (!RAILWAY_WEBHOOK_URL) {
        console.log('RAILWAY_WEBHOOK_URL non configurato');
        return;
    }

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const req = https.request(RAILWAY_WEBHOOK_URL, options, (res) => {
        console.log(`Riavvio bot - Status: ${res.statusCode}`);
    });

    req.on('error', (error) => {
        console.error('Errore nel riavviare il bot:', error);
    });

    req.end();
}

// Controlla ogni minuto se è ora di riavviare
setInterval(() => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Riavvia alle 07:00
    if (hour === 7 && minute === 0) {
        console.log('Ora di riavviare il bot per la mattina!');
        restartBot();
    }
}, 60000); // Controlla ogni minuto

console.log('Scheduler di riavvio attivo - riavvierà il bot alle 07:00');

// Mantieni lo script attivo
setInterval(() => {
    // Heartbeat ogni ora
    console.log(`Scheduler attivo - ${new Date().toLocaleTimeString()}`);
}, 3600000);
