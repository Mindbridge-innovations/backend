const { db } = require('./firebaseConfig');

// Function to update user responses in Firebase
const updateResponses = async (userId, responses) => {
  if (!userId || !responses) {
    throw new Error('Missing userId or responses data');
  }

  const responsesRef = db.ref(`responses/${userId}`);
  await responsesRef.update(responses);
};

module.exports = { updateResponses };