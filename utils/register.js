// utils/register.js
const { hashPassword } = require('./hash');
const { getDatabase, ref, set, get } = require('firebase/database');
const { firebaseApp } = require('./firebaseConfig');
const sendEmail = require('./mailer');

const registerUser = async (username, email, password, firstName, lastName, age) => {
  const db = getDatabase(firebaseApp);

  // Check if the email already exists
  const emailRef = ref(db, `users/${email.replace(/\./g, ',')}`);
  const emailSnapshot = await get(emailRef);
  if (emailSnapshot.exists()) {
    throw new Error('Email already in use');
  }

  // Check if the username already exists
  const usernameRef = ref(db, `usernames/${username}`);
  const usernameSnapshot = await get(usernameRef);
  if (usernameSnapshot.exists()) {
    throw new Error('Username already taken');
  }

  try {
    const hashedPassword = await hashPassword(password);

    // Save user details to the database
    const userRef = ref(db, `users/${email.replace(/\./g, ',')}`);
    const userData = {
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      age,
    };

    await set(userRef, userData);
    // Also, save the username to prevent duplicates
    await set(usernameRef, { email });
    await sendEmail(email, firstName);

    return { success: true, message: 'User registered successfully' };
  } catch (error) {
    console.log(`Error while trying to create a new user: ${error.message}`);
    console.error('Error registering user:', error);
    throw error;
  }
};

module.exports = { registerUser };