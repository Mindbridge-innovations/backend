// utils/getTokenByUserId.js
const { db } = require('./firebaseConfig');

const getTokenByUserId = async (userId) => {
  const tokensRef = db.ref('tokens');
  const snapshot = await tokensRef.orderByChild('userId').equalTo(userId).once('value');
  if (snapshot.exists()) {
    const tokens = snapshot.val();
    // Assuming each user has only one active token at a time
    const activeToken = Object.keys(tokens).find(key => tokens[key].isActive);
    return tokens[activeToken].token;
  } else {
    throw new Error('No active token found for this user.');
  }
};

module.exports = { getTokenByUserId };