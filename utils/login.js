// utils/login.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase, ref, get, query, orderByChild, equalTo } = require('firebase/database');
const { firebaseApp } = require('./firebaseConfig');

const secretKey = process.env.JWT_SECRET;

const loginUser = async (email, password) => {
  try {
    if (typeof email !== 'string') {
      throw new Error('Email must be a string');
    }

    // Fetch user data from the database based on the provided email
    const db = getDatabase(firebaseApp);
    const usersRef = ref(db, 'users');
    const usersQuery = query(usersRef, orderByChild('email'), equalTo(email));
    const snapshot = await get(usersQuery);

    // Check if we got any users
    if (snapshot.exists()) {
      const usersData = snapshot.val();
      // Find the user by email
      const userKey = Object.keys(usersData).find(key => usersData[key].email === email);
      const userData = usersData[userKey];

      //check if the user is verified
      if (!userData.isVerified) {
        throw new Error('User is  not verified yet! Please check your inbox for verification mail.');
      }
      // Compare the provided password with the hashed password stored in the database
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (!passwordMatch) {
        throw new Error('Invalid password');
      }

      // Generate a JWT token
      const token = jwt.sign({ userId: userData.userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

      // Return the token and user data (excluding the password)
      const { password: userPassword, ...userWithoutPassword } = userData;
      return { token, userData: userWithoutPassword };
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error(`Error logging in: ${error.message}`);
    throw error;
  }
};

module.exports = { loginUser };