// utils/register.js
const { hashPassword } = require('./hash');
const { getDatabase, ref, set } = require('firebase/database');
const { firebaseApp } = require('./firebaseConfig'); // Make sure to export the Firebase app instance

const registerUser = async (username, email, password, firstName, lastName, age) => {
  try {
    const hashedPassword = await hashPassword(password);

    // Save user details to the database (Firebase in this case)
    const db = getDatabase(firebaseApp);
    const userRef = ref(db, `users/${email.replace('.', ',')}`);

    const userData = {
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      age,
    };

    await set(userRef, userData);

    return { success: true, message: 'User registered successfully' };
  } catch (error) {
    throw new Error('Error registering user');
  }
};

module.exports = { registerUser };
