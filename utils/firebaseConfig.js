//utils/firebaseConfig.js
require('dotenv').config();
const admin = require('firebase-admin');

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace the escaped newline characters in the private key
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
const db = admin.database();

module.exports = { admin, db };
