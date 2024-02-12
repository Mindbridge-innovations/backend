// utils/generatePasswordResetToken.js
const crypto = require('crypto');
const { getDatabase, ref, set, get } = require('firebase/database');
const { firebaseApp } = require('./firebaseConfig');
const sendEmail = require('./mailer');
const Mailgen = require('mailgen');

const generatePasswordResetToken = async (email) => {
  const db = getDatabase(firebaseApp);
  const userRef = ref(db, `users/${email.replace(/\./g, ',')}`);
  const snapshot = await get(userRef);
  const userData = snapshot.val();

  if (!userData) {
    throw new Error('User not found');
  }

  // Generate a random token
  const token = crypto.randomBytes(20).toString('hex');
  // Set token expiration time (e.g., 1 hour)
  const expires = Date.now() + 3600000;

  // Save the token and expiration time in the database
  await set(ref(db, `passwordResetTokens/${email.replace(/\./g, ',')}`), { token, expires });

  // Configure Mailgen with a password reset email template
  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'Your App Name',
      link: `${process.env.CLIENT_URL}/reset-password/${token}`, // URL to the password reset page in your app
    },
  });

  const emailTemplate = mailGenerator.generate({
    body: {
      name: userData.firstName || email,
      intro: 'You have received this email because a password reset request for your account was received.',
      action: {
        instructions: 'Click the button below to reset your password:',
        button: {
          color: '#DC4D2F',
          text: 'Reset Password',
          link: `${process.env.CLIENT_URL}/reset-password/${token}`,
        },
      },
      outro: 'If you did not request a password reset, no further action is required on your part.',
    },
  });

  // Send the password reset email
  await sendEmail(email, 'Password Reset', emailTemplate);

  return { success: true, message: 'Password reset token sent to email' };
};

module.exports = generatePasswordResetToken;