// util/sendMatchEmail.js
const { admin } = require('./firebaseConfig');
const sendEmail = require('./mailer'); 

const sendMatchEmails = async (clientEmail, therapistEmail, clientUsername, therapistUsername) => {
  // Prepare email content for therapist
  const therapistEmailBody = {
    body: {
      name: therapistUsername,
      intro: `You have been matched with a new client, ${clientUsername}!`,
      action: {
        instructions: "Login to your account to view their profile.",
        button: {
          color: "#22BC66",
          text: "View Client Profile",
          link: `${process.env.APP_URL}`
        }
      },
      outro: "Thank you for using our service!"
    }
  };

  // Send email to therapist
  await sendEmail(therapistEmail, "New Client Match", therapistEmailBody);

  // Prepare email content for client
  const clientEmailBody = {
    body: {
      name: clientUsername,
      intro: `You have been matched with a therapist, ${therapistUsername}!`,
      action: {
        instructions: "Login to your account to view their profile.",
        button: {
          color: "#22BC66",
          text: "View Therapist Profile",
          link: `${process.env.APP_URL}`
        }
      },
      outro: "Thank you for using our service!"
    }
  };

  // Send email to client
  await sendEmail(clientEmail, "New Therapist Match", clientEmailBody);
};

module.exports = sendMatchEmails;
