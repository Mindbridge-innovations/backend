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
router.post('/api/login', loginUser);

module.exports = router;
