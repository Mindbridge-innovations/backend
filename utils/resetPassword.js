// utils/resetPassword.js
const { getDatabase, ref, set, get, query, orderByChild, equalTo } = require('firebase/database');
const { firebaseApp } = require('./firebaseConfig');
const { hashPassword } = require('./hash');

const resetPassword = async (email, token, newPassword) => {
  const db = getDatabase(firebaseApp);

  // Query the database for a user with the specified email
  const usersRef = ref(db, 'users');
  const usersQuery = query(usersRef, orderByChild('email'), equalTo(email));
  const userSnapshot = await get(usersQuery);

  if (!userSnapshot.exists()) {
    throw new Error('User not found');
  }

  // Assuming email is unique, there should only be one match
  const usersData = userSnapshot.val();
  const userId = Object.keys(usersData)[0];
  const userData = usersData[userId];

  // Reference to the password reset token in the database
  const tokenRef = ref(db, `passwordResetTokens/${userId}`);
  const tokenSnapshot = await get(tokenRef);
  const tokenData = tokenSnapshot.val();

  if (!tokenData || tokenData.token !== token || tokenData.expires < Date.now()) {
    throw new Error('Invalid or expired password reset token');
  }

  // Hash the new password
  const hashedPassword = await hashPassword(newPassword);

  // Update the user's password in the database
  await set(ref(db, `users/${userId}`), { ...userData, password: hashedPassword });

  // Delete the password reset token from the database
  await set(tokenRef, null);

  return { success: true, message: 'Password reset successfully' };
};

module.exports = resetPassword;