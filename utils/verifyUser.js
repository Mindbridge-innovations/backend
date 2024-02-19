// utils/verifyUser.js
const { getDatabase, ref, get, query, orderByChild, equalTo, set } = require('firebase/database');
const { firebaseApp } = require('./firebaseConfig');

const verifyUser = async (token) => {
  const db = getDatabase(firebaseApp);
  const usersRef = ref(db, 'users');
  const usersQuery = query(usersRef, orderByChild('verificationToken'), equalTo(token));
  const snapshot = await get(usersQuery);

  if (snapshot.exists()) {
    const usersData = snapshot.val();
    const userKey = Object.keys(usersData).find(key => usersData[key].verificationToken === token);
    const userRef = ref(db, `users/${userKey}`);

    // Update the isVerified field to true
    await set(userRef, { ...usersData[userKey], isVerified: true, verificationToken: null });

    return { verified: true, userKey };
  } else {
    return { verified: false };
  }
};

module.exports = verifyUser;