// utils/getInteractions.js
const { db } = require('./firebaseConfig');

const getInteractionsByToken = async (token) => {
  const interactionsRef = db.ref(`interactions/${token}`);
  const snapshot = await interactionsRef.once('value');
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    throw new Error('No interactions found for this user.');
  }
};

module.exports = { getInteractionsByToken };