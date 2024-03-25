// routes/router.js
const express = require('express');
const admin=require('firebase-admin')
const router = express.Router();
const {registerUser} = require('../utils/register')
const {loginUser} = require('../utils/login')
const generatePasswordResetToken = require('../utils/generatePasswordResetToken');
const resetPassword = require('../utils/resetPassword');
const authenticateToken = require('../middleware/authenticateToken');
const updateUserProfile = require('../utils/updateUserProfile');
const verifyUser = require('../utils/verifyUser');
const { getUserDetails } = require('../utils/getUser');
const {createAppointment} = require('../utils/appointment')


router.post('/api/register', async (req, res) => {;
    try {
      const { firstName, lastName,email,phoneNumber,username,password,role,responses} = req.body;
      const result = await registerUser(firstName, lastName,email,phoneNumber,username,password,role,responses);
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

//verify new user
router.get('/api/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const result = await verifyUser(token);

    if (result.verified) {
      // Redirect to a confirmation page or login page
      res.redirect(`${process.env.APP_URL}`);
    } else {
      res.status(404).json({ message: 'User not found or already verified' });
    }
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({ message: error.message });
  }
});

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

// Get user details endpoint
router.get('/api/user', authenticateToken, async (req, res) => {
  try {
    // The userId is extracted from the JWT token after authentication
    const userId = req.user.userId;
    const userDetails = await getUserDetails(userId);
    res.status(200).json(userDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to create a new appointment
router.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    // The userId is extracted from the JWT token after authentication
    const userId = req.user.userId;
    const appointmentData = req.body;

    // Validate appointmentData here (e.g., check for required fields)

    const result = await createAppointment(userId, appointmentData);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

router.post('/initiateCall', (req, res) => {
  const { callerId, calleeId,callId } = req.body;
  const calleeFCMToken = getCalleeFCMToken(calleeId);

  const message = {
    notification: {
      title: 'Incoming Video Call',
      body: 'You have an incoming video call.',
    },
    data: {
      callId: callId,
      callerId: callerId,
    },
    token: calleeFCMToken,
  };

  admin.messaging().send(message)
    .then((response) => {
      res.status(200).send('Call notification sent successfully');
    })
    .catch((error) => {
      res.status(500).send('Error sending call notification');
    });
});



module.exports = router;
