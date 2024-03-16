// utils/getUser.js
const { getDatabase, ref, get, child } = require('firebase/database');
const { firebaseApp } = require('./firebaseConfig');

const getUserDetails = async (userId) => {
  const db = getDatabase(firebaseApp);
  const userRef = ref(db, 'users');

  try {
    // Fetch user data from the database based on the provided userId
    const snapshot = await get(child(userRef, userId));

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