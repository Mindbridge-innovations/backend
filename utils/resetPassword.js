// utils/resetPassword.js
const { getDatabase, ref, set, get } = require('firebase/database');
const { firebaseApp } = require('./firebaseConfig');
const { hashPassword } = require('./hash');

const resetPassword = async (email, token, newPassword) => {
  const db = getDatabase(firebaseApp);
  
  // Reference to the password reset token in the database
  const tokenRef = ref(db, `passwordResetTokens/${email.replace(/\./g, ',')}`);
  const tokenSnapshot = await get(tokenRef);
  const tokenData = tokenSnapshot.val();

  if (!tokenData || tokenData.token !== token || tokenData.expires < Date.now()) {
    throw new Error('Invalid or expired password reset token');
  }

  // Reference to the user in the database
  const userRef = ref(db, `users/${email.replace(/\./g, ',')}`);
  const userSnapshot = await get(userRef);
  const userData = userSnapshot.val();

  if (!userData) {
    throw new Error('User not found');
  }

  // Hash the new password
  const hashedPassword = await hashPassword(newPassword);

  // Update the user's password in the database
  await set(userRef, { ...userData, password: hashedPassword });

  // Delete the password reset token from the database
  await set(tokenRef, null);

  return { success: true, message: 'Password reset successfully' };
};

module.exports = resetPassword;