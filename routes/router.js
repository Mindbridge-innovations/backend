// routes/router.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createFeedback } = require('../utils/feedback');

// Set up multer for file handling
const upload = multer({ storage: multer.memoryStorage() });
const {registerUser} = require('../utils/register')
const {loginUser} = require('../utils/login')
const generatePasswordResetToken = require('../utils/generatePasswordResetToken');
const resetPassword = require('../utils/resetPassword');
const authenticateToken = require('../middleware/authenticateToken');
const updateUserProfile = require('../utils/updateUserProfile');
const verifyUser = require('../utils/verifyUser');
const { getUserDetails } = require('../utils/getUser');
const {createAppointment} = require('../utils/appointment')
const { matchClientsWithTherapists } = require('../utils/match');
const {createRating}=require('../utils/rating');
const {getRatingsAndClientDetails}=require('../utils/getRatings');
const { getFeedbacksAndTherapists } = require('../utils/getFeedbacks'); // Adjust the path as necessary





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

// Route to trigger the matching process
router.post('/api/match', authenticateToken,async (req, res) => {
  const userId = req.user.userId;
  try {
    const matches = await matchClientsWithTherapists(userId);
    res.status(200).json({ success: true, matches });
  } catch (error) {
    console.error('Error during matching process:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/api/ratings', authenticateToken, async (req, res) => {
  try {
    // The userId is extracted from the JWT token after authentication
    const userId = req.user.userId;
    const ratingData = req.body;

    // Validate ratingData here (e.g., check for required fields)

    const result = await createRating(userId, ratingData);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Endpoint for submitting feedback
router.post('/api/feedbacks', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    // The userId is extracted from the JWT token after authentication
    const userId = req.user.userId;
    const { feedback, clientId } = req.body;
    let fileData = null;

    // If a file is uploaded, prepare the file data
    if (req.file) {
      fileData = {
        fileBuffer: req.file.buffer,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
      };
    }

    // Save the feedback and file to the database and storage
    const result = await createFeedback(userId, feedback, clientId , fileData);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Endpoint to get ratings and client details for a therapist
router.get('/api/therapist/ratings', authenticateToken, async (req, res) => {
  try {
    const therapistId = req.user.userId; // Assuming the therapist's userId is in the JWT token
    const ratingsAndClients = await getRatingsAndClientDetails(therapistId);
    res.status(200).json(ratingsAndClients);
  } catch (error) {
    console.error('Error fetching ratings and client details:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/api/client/feedbacks', authenticateToken,async (req, res) => {
  try {
      const userId = req.user.userId; // Assuming you have middleware to authenticate and add user info
      const feedbacksAndTherapists = await getFeedbacksAndTherapists(userId);
      res.status(200).json(feedbacksAndTherapists);
  } catch (error) {
      console.error('Error fetching feedbacks and therapists:', error);
      res.status(500).json({ message: error.message });
  }
});

module.exports = router;
