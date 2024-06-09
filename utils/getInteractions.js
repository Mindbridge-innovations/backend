// utils/getInteractions.js
const { db } = require('./firebaseConfig');

const getInteractionsByUserId = async (userId) => {
  const interactionsRef = db.ref(`interactions/${userId}`);
  const snapshot = await interactionsRef.once('value');
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    throw new Error('No interactions found for this user.');
  }
};

module.exports = { getInteractionsByUserId };