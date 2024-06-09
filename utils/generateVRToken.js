// utils/generateVRToken.js
const { db } = require('./firebaseConfig');
const ShortUniqueId = require('short-unique-id');

const generateVRToken = async (userId, therapistId) => {
  const uid = new ShortUniqueId({ length: 6 });
  const token = uid.rnd();

  const tokenRef = db.ref(`tokens/${token}`);
  const tokenSnapshot = await tokenRef.once('value');

  if (tokenSnapshot.exists()) {
    throw new Error('Token collision occurred. Please try again.');
  }

  await tokenRef.set({
    token: token,
    userId: userId,  // Include the userId in the token data
    therapistId: therapistId,
    isActive: true,
    createdAt: new Date().toISOString()
  });

  return token;
};

module.exports = { generateVRToken };