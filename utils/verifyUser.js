// utils/verifyUser.js
const { admin, db } = require('./firebaseConfig');
const sendApprovalProcessEmail = require('./sendApprovalEmail');

const verifyUser = async (token) => {
  const usersRef = db.ref('users');
  const usersQuery = usersRef.orderByChild('verificationToken').equalTo(token);
  const snapshot = await usersQuery.once('value');

  if (snapshot.exists()) {
    const usersData = snapshot.val();
    const userKey = Object.keys(usersData).find(key => usersData[key].verificationToken === token);
    const userRef = db.ref(`users/${userKey}`);
    const userData = usersData[userKey];
    
    // Update the isVerified field to true and remove the verificationToken
    await userRef.update({ isVerified: true, verificationToken: null });

    // Check if the user is a therapist and send them an email about the approval process
    if (userData.role === 'therapist') {
      await sendApprovalProcessEmail(userData.email, userData.firstName);
    }

    return { verified: true, userKey };
  } else {
    return { verified: false };
  }
};

module.exports = verifyUser;