// utils/getUser.js
const { admin, db } = require('./firebaseConfig');

const getUserDetails = async (userId) => {
  const userRef = db.ref(`users/${userId}`);

  try {
    // Fetch user data from the database based on the provided userId
    const snapshot = await userRef.once('value');

    if (snapshot.exists()) {
      const userData = snapshot.val();
      // Exclude the password from the user details
      const { password, ...userWithoutPassword } = userData;
      return userWithoutPassword;
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error(`Error fetching user details: ${error.message}`);
    throw error;
  }
};

module.exports = { getUserDetails };