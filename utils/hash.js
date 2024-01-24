// utils/hash.js
const bcrypt = require('bcryptjs');

exports.hashPassword = async (password) => {
  const ROUNDS = process.env.ROUNDS || 12;

  try {
    const salt = await bcrypt.genSalt(parseInt(ROUNDS));
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw new Error('Error hashing password');
  }
};
