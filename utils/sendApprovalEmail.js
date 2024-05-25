// utils/sendApprovalEmail.js
const sendEmail = require('./mailer');

const sendApprovalProcessEmail = async (email, firstName) => {
  const emailBody = {
    body: {
      name: firstName,
      intro: "Your MindBridge account has been verified!",
      action: {
        instructions: "Please click the button and wait while we review your credentials. We will notify you once your account is approved and fully activated.",
        button: {
          color: "#22BC66",
          text: "Visit MindBridge",
          link: `${process.env.APPROVAL_URL}` // Link to the homepage or dashboard
        }
      },
      outro: "Thank you for your patience. If you have any questions, feel free to reply to this email."
    }
  };

  const subject = "MindBridge Therapist Verification Process";

  // Send the email
  await sendEmail(email, subject, emailBody);
};

module.exports = sendApprovalProcessEmail;