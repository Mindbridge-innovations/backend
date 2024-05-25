// middleware/verifyTherapist.js
const jwt = require('jsonwebtoken');
const { db } = require('../utils/firebaseConfig');

const verifyTherapist = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userRef = db.ref(`users/${decoded.userId}`);
    const userSnapshot = await userRef.once('value');
    const userData = userSnapshot.val();

    if (userData && userData.role === 'therapist') {
      req.user = userData;
      next();
    } else {
      res.status(403).send({ message: 'Access denied. Only therapists can perform this operation.' });
    }
  } catch (error) {
    res.status(401).send({ message: 'Invalid token' });
  }
};

module.exports = verifyTherapist;