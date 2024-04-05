//utils/register.js
const { hashPassword } = require('./hash');
const crypto = require('crypto');
const { admin, db } = require('./firebaseConfig');
const sendRegistrationEmail = require('./sendRegistrationEmail');

const registerUser = async (firstName, lastName, email, phoneNumber, username, password, role, responses) => {
  // Query the database for a user with the specified email
  const usersRef = db.ref('users');
  const emailQuery = usersRef.orderByChild('email').equalTo(email);
  const emailSnapshot = await emailQuery.once('value');

  // Check if the email already exists
  if (emailSnapshot.exists()) {
    throw new Error('Email already in use');
  }

  // Check if the username already exists
  const usernameRef = db.ref(`usernames/${username}`);
  const usernameSnapshot = await usernameRef.once('value');
  if (usernameSnapshot.exists()) {
    throw new Error('Username already taken');
  }

  try {
    const hashedPassword = await hashPassword(password);

    // Generate a new unique userId
    const newUserRef = usersRef.push();
    const userId = newUserRef.key;

    // Generate a verification token for the new user
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Save user details to the database
    const userData = {
      userId,
      username,
      email,
      phoneNumber,
      role,
      password: hashedPassword,
      firstName,
      lastName,
      isVerified: false,
      verificationToken,
      ...(role === "client" && { isMatched: false }),
    };

    await newUserRef.set(userData);
    // Also, save the username to prevent duplicates
    await usernameRef.set({ userId });

    // Save responses to a separate document (table) referenced by userId
    if (responses) {
      const responsesRef = db.ref(`responses/${userId}`);
      await responsesRef.set(responses);
    }

    await sendRegistrationEmail(email, firstName, verificationToken);

    return { success: true, message: 'User registered successfully', userId };
  } catch (error) {
    console.log(`Error while trying to create a new user: ${error.message}`);
    console.error('Error registering user:', error);
    throw error;
  }
};

module.exports = { registerUser };