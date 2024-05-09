// utils/generatePasswordResetToken.js
const crypto = require('crypto');
const { admin, db } = require('./firebaseConfig');
const sendEmail = require('./mailer');

const generatePasswordResetToken = async (email) => {
  // Query the database for a user with the specified email
  const usersRef = db.ref('users');
  const usersQuery = usersRef.orderByChild('email').equalTo(email);
  const userSnapshot = await usersQuery.once('value');

  if (!userSnapshot.exists()) {
    throw new Error('User not found');
  }

  // Assuming email is unique, there should only be one match
  const usersData = userSnapshot.val();
  const userId = Object.keys(usersData)[0];
  const userData = usersData[userId];

  // Generate a random token
  const token = crypto.randomBytes(20).toString('hex');
  // Set token expiration time (e.g., 1 hour)
  const expires = Date.now() + 3600000;

  // Save the token and expiration time using the userId
  const passwordResetTokensRef = db.ref(`passwordResetTokens/${userId}`);
  await passwordResetTokensRef.set({ token, expires });

  // Email subject
  const subject = 'Password Reset Request';

  // Email body content
  const emailBody = {
    body: {
      name: userData.firstName || email,
      intro: 'You have received this email because a password reset request for your account was received.',
      action: {
        instructions: 'Click the button below to reset your password. The password reset link is valid for 1 hour.',
        button: {
          color: '#DC4D2F',
          text: 'Reset Password',
          link: `${process.env.CLIENT_URL}/v1/api/reset-password/${token}`, // Update with the correct link
        },
      },
      outro: 'If you did not request a password reset, no further action is required on your part.',
    },
  };

  // Send the password reset email using your sendEmail function
  await sendEmail(email, subject, emailBody);

  return { success: true, message: 'Password reset token sent to email' };
};

module.exports = generatePasswordResetToken;