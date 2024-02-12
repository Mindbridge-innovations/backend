// utils/login.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase, ref, get } = require('firebase/database');
const { firebaseApp } = require('./firebaseConfig'); 

const secretKey = process.env.JWT_SECRET; 

const loginUser = async (email, password) => {
    try {
      if (typeof email !== 'string') {
        throw new Error('Email must be a string');
      }
  
      // Fetch user data from the database based on the provided email
      const db = getDatabase(firebaseApp);
      const userRef = ref(db, `users/${email.replace(/\./g, ',')}`);
      const snapshot = await get(userRef);
      const userData = snapshot.val();
      console.log(userData);
      if (!userData) {
        throw new Error('User not found');
      }
  
      if (!userData.password) {
        throw new Error('Password not found for the user');
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
      console.error(`Error logging in: ${error.message}`); // Log the error for debugging purposes
      throw error; // Re-throw the error to be handled by the caller
    }
  };
module.exports = { loginUser };
