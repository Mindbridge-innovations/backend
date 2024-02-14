const { hashPassword } = require('./hash');
const { getDatabase, ref, set, get, push } = require('firebase/database');
const { firebaseApp } = require('./firebaseConfig');
const sendRegistrationEmail = require('./sendRegistrationEmail');

const registerUser = async (firstName, lastName,email,phoneNumber,username,password,role) => {
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

    // Generate a new unique userId
    const newUserRef = push(ref(db, 'users'));
    const userId = newUserRef.key;

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
    };

    await set(newUserRef, userData);
    // Also, save the username to prevent duplicates
    await set(usernameRef, { userId });

    await sendRegistrationEmail(email, firstName);

    return { success: true, message: 'User registered successfully', userId };
  } catch (error) {
    console.log(`Error while trying to create a new user: ${error.message}`);
    console.error('Error registering user:', error);
    throw error;
  }
};

module.exports = { registerUser };