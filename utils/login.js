// utils/login.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase, ref, get } = require('firebase/database');
const { firebaseApp } = require('./firebaseConfig'); // Make sure to export the Firebase app instance

const secretKey = process.env.JWT_SECRET || 'yourSecretKey'; // Provide a secure secret key in production

const loginUser = async (email, password) => {
  try {
    // Fetch user data from the database based on the provided email
    const db = getDatabase(firebaseApp);
    const userRef = ref(db, `users/${email.replace('.', ',')}`);
    const snapshot = await get(userRef);
    const userData = snapshot.val();

    if (!userData) {
      throw new Error('User not found');
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (!passwordMatch) {
      throw new Error('Invalid password');
    }

    // Generate a JWT token
    const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });

    return { token, userData };
  } catch (error) {
    throw new Error('Error logging in');
  }
};

module.exports = { loginUser };
