const sendWelcomeSMS = require('./sendWelcomeSms');

const phoneNumber = process.argv[2];
const firstName = process.argv[3];

sendWelcomeSMS(phoneNumber, firstName).catch(console.error);