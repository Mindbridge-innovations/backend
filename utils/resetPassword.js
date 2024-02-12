// utils/resetPassword.js
const bcrypt = require('bcryptjs');
const { getDatabase, ref, set, get } = require('firebase/database');
const { firebaseApp } = require('./firebaseConfig');
const { hashPassword } = require('./hash');

const resetPassword = async (email, token, newPassword) => {
  const db = getDatabase(firebaseApp);
  const tokenRef = ref(db, `passwordResetTokens/${email.replace(/\./g, ',')}`);
  const tokenSnapshot = await get(tokenRef);
  const tokenData = tokenSnapshot.val();

  if (!tokenData || tokenData.token !== token || tokenData.expires < Date.now()) {
    throw new Error('Invalid or expired password reset token');
  }

  // Hash the new password
  const hashedPassword = await hashPassword(newPassword);

  // Update the user's password in the database
  const userRef = ref(db, `users/${email.replace(/\./g, ',')}`);
  await set(userRef, { ...userData, password: hashedPassword });

  // Delete the password reset token from the database
  await set(tokenRef, null);

  return { success: true, message: 'Password reset successfully' };
};

module.exports = resetPassword;