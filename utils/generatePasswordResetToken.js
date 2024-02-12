//utils/generatePasswordResetToken.js
const crypto = require('crypto');
const{getDatabse, ref,set,get} = require('firebase/database')