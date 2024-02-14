// routes/router.js
const express = require('express');
const router = express.Router();
const {registerUser} = require('../utils/register')
const {loginUser} = require('../utils/login')
const generatePasswordResetToken = require('../utils/generatePasswordResetToken');
const resetPassword = require('../utils/resetPassword');
const authenticateToken = require('../middleware/authenticateToken');
const updateUserProfile = require('../utils/updateUserProfile');

router.post('/api/register', async (req, res) => {;
    try {
      const { username, email,phoneNumber,role, password, firstName, lastName} = req.body;
      const result = await registerUser(username, email, phoneNumber, role, password, firstName, lastName);
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

// Forgot password endpoint
router.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await generatePasswordResetToken(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset password endpoint
router.post('/api/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    const result = await resetPassword(email, token, newPassword);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

// Protected routes
//Route to update user profile
router.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    // The userId should be extracted from the JWT token after authentication
    const userId = req.user.userId;
    const { firstName, lastName, age } = req.body;

    // Construct the updates object
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (age) updates.age = age;

    // Update the user's profile
    const result = await updateUserProfile(userId, updates);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;
