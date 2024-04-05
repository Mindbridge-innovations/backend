// utils/resetPassword.js
const { admin, db } = require('./firebaseConfig');
const { hashPassword } = require('./hash');

const resetPassword = async (email, token, newPassword) => {
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

  // Reference to the password reset token in the database
  const tokenRef = db.ref(`passwordResetTokens/${userId}`);
  const tokenSnapshot = await tokenRef.once('value');
  const tokenData = tokenSnapshot.val();

  if (!tokenData || tokenData.token !== token || tokenData.expires < Date.now()) {
    throw new Error('Invalid or expired password reset token');
  }

  // Hash the new password
  const hashedPassword = await hashPassword(newPassword);

  // Update the user's password in the database
  const userPasswordRef = db.ref(`users/${userId}/password`);
  await userPasswordRef.set(hashedPassword);

  // Delete the password reset token from the database
  await tokenRef.remove();

  return { success: true, message: 'Password reset successfully' };
};

module.exports = resetPassword;