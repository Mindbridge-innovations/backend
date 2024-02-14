// utils/sendRegistrationEmail.js
const sendEmail = require('./mailer');

const sendRegistrationEmail = async (email, firstName) => {
  const emailBody = {
    body: {
      name: firstName,
      intro: "Welcome to MindBridge! We're very excited to have you on board.",
      action: {
        instructions: "To get started with MindBridge, please click here:",
        button: {
          color: "#22BC66",
          text: "Confirm your account",
          link: `${process.env.CLIENT_URL}` // Make sure this link is correct
        }
      },
      outro: "Need help, or have questions? Just reply to this email, we'd love to help."
    }
  };

  const subject = "MindBridge Account Confirmation!";

  // Send the email
  await sendEmail(email, subject, emailBody);
};

module.exports = sendRegistrationEmail;