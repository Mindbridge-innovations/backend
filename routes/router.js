// routes/router.js
const express = require('express');
const router = express.Router();
const {registerUser} = require('../utils/register')
const {loginUser} = require('../utils/login')


router.post('/api/register', async (req, res) => {
    try {
      const { username, email, password, firstName, lastName, age } = req.body;
      const result = await registerUser(username, email, password, firstName, lastName, age);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
 router.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body; 
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const result = await loginUser(email, password); // Pass them to loginUser
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
