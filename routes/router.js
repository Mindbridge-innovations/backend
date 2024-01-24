// routes/router.js
const express = require('express');
const router = express.Router();
const {registerUser} = require('./utils/register')
const {loginUserUser} = require('./utils/login')


router.post('/api/register', registerUser);
router.post('/api/login', loginUser);

module.exports = router;
