// utils/azureHealthBot.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const WEBCHAT_SECRET = process.env.WEBCHAT_SECRET;
const APP_SECRET = process.env.APP_SECRET;
const DIRECTLINE_ENDPOINT_URI = process.env.DIRECTLINE_ENDPOINT_URI;
const directLineTokenEp = `https://${DIRECTLINE_ENDPOINT_URI || "directline.botframework.com"}/v3/directline/tokens/generate`;

async function generateToken(userId, userName, locale, lat, long) {
    let fetch;
    try {
        fetch = (await import('node-fetch')).default;
    } catch (err) {
        console.error('Failed to import node-fetch:', err);
        throw err;
    }

    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${WEBCHAT_SECRET}`
        }
    };

    try {
        const fetchResponse = await fetch(directLineTokenEp, options);
        const parsedBody = await fetchResponse.json();

        const response = {
            userId: userId || crypto.randomBytes(4).toString('hex'),
            userName,
            locale,
            connectorToken: parsedBody.token,
            directLineURI: DIRECTLINE_ENDPOINT_URI
        };

        if (lat && long) {
            response.location = { lat, long };
        }

        const jwtToken = jwt.sign(response, APP_SECRET);
        return { success: true, token: jwtToken };
    } catch (err) {
        console.error("Error generating token for Azure Health Bot:", err);
        throw new Error('Failed to generate token');
    }
}

module.exports = { generateToken };