// utils/verifyUser.js
const { admin, db } = require('./firebaseConfig');

const verifyUser = async (token) => {
  const usersRef = db.ref('users');
  const usersQuery = usersRef.orderByChild('verificationToken').equalTo(token);
  const snapshot = await usersQuery.once('value');

  if (snapshot.exists()) {
    const usersData = snapshot.val();
    const userKey = Object.keys(usersData).find(key => usersData[key].verificationToken === token);
    const userRef = db.ref(`users/${userKey}`);

    // Update the isVerified field to true and remove the verificationToken
    await userRef.update({ isVerified: true, verificationToken: null });

    return { verified: true, userKey };
  } else {
    return { verified: false };
  }
};

module.exports = verifyUser;