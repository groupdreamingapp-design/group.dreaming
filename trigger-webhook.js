const fetch = require('node-fetch');

async function triggerWebhook() {
    try {
        const response = await fetch('http://localhost:3000/api/webhooks/mercadopago?topic=payment&id=143144152995', {
            method: 'POST',
        });
        const text = await response.text();
        console.log(`Status: ${response.status}`);
        console.log(`Body: ${text}`);
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

triggerWebhook();
