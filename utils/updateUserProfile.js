// utils/updateUserProfile.js
const { getDatabase, ref, update } = require('firebase/database');
const { firebaseApp } = require('./firebaseConfig');

const updateUserProfile = async (userId, updates) => {
  const db = getDatabase(firebaseApp);
  const userRef = ref(db, `users/${userId}`);

  try {
    // Update the user's profile information in the database
    await update(userRef, updates);
    return { success: true, message: 'User profile updated successfully' };
  } catch (error) {
    console.error(`Error updating user profile: ${error.message}`);
    throw error;
  }
};

module.exports = updateUserProfile;