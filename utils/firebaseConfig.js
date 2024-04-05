//utils/firebaseConfig.js
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace the escaped newline characters in the private key
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Make sure this is set

});

// As an admin, the app has access to read and write all data, regardless of Security Rules
const db = admin.database();

module.exports = { admin, db };
