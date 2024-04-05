// utils/updateUserProfile.js
const { admin, db } = require('./firebaseConfig');

const updateUserProfile = async (userId, updates) => {
  const userRef = db.ref(`users/${userId}`);

  try {
    // Update the user's profile information in the database
    await userRef.update(updates);
    return { success: true, message: 'User profile updated successfully' };
  } catch (error) {
    console.error(`Error updating user profile: ${error.message}`);
    throw error;
  }
};

module.exports = updateUserProfile;