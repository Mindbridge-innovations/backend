// utils/generateVRToken.js
const { db } = require('./firebaseConfig');
const ShortUniqueId = require('short-unique-id');

const generateVRToken = async () => {
  const uid = new ShortUniqueId({ length: 6 });
  const token = uid();

  const tokenRef = db.ref(`VRTokens/${token}`);
  const tokenSnapshot = await tokenRef.once('value');

  if (tokenSnapshot.exists()) {
    throw new Error('Token collision occurred. Please try again.');
  }

  await tokenRef.set({
    token: token,
    isActive: true,
    createdAt: new Date().toISOString()
  });

  return token;
};

module.exports = { generateVRToken };