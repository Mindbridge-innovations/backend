const { Vonage } = require('@vonage/server-sdk');

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
});

const sendWelcomeSMS = (phoneNumber, firstName) => {
  const from = "YourBrand";
  const to = phoneNumber;
  const text = `Hello ${firstName}, welcome to MindBridge! Please check your email to confirm your account.`;

  vonage.message.sendSms(from, to, text, (err, responseData) => {
    if (err) {
      console.error(err);
    } else {
      if(responseData.messages[0]['status'] === "0") {
        console.log("Message sent successfully.");
      } else {
        console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
      }
    }
  });
};

module.exports = sendWelcomeSMS;