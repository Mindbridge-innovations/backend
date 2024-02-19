const { Vonage } = require('@vonage/server-sdk');

// Assuming you have set your credentials in environment variables
const credentials = {
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
};

// Options can be an empty object if you don't have any specific options
const options = {};

const vonage = new Vonage(credentials, options);

const sendWelcomeSMS = async (phoneNumber, firstName) => {
  const from = "MindBridge";
  const to = `+256${phoneNumber}`; // Your phone number with country code
  const text = `Hello ${firstName}, welcome to MindBridge! Please check your email to confirm your account.`;

  try {
    const resp = await vonage.sms.send({
      from: from,
      to: to,
      text: text,
    });
    console.log("Message sent successfully:", resp);
  } catch (err) {
    console.error("Error sending SMS:", err);
  }
};

module.exports = sendWelcomeSMS;