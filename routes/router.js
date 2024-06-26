// routes/router.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const multer = require('multer');
const { createFeedback } = require('../utils/feedback');
const { db } = require('../utils/firebaseConfig');
const upload = multer({ storage: multer.memoryStorage() });
const { registerUser } = require('../utils/register')
const { loginUser } = require('../utils/login')
const generatePasswordResetToken = require('../utils/generatePasswordResetToken');
const resetPassword = require('../utils/resetPassword');
const authenticateToken = require('../middleware/authenticateToken');
const updateUserProfile = require('../utils/updateUserProfile');
const verifyUser = require('../utils/verifyUser');
const { getUserDetails } = require('../utils/getUser');
const { createAppointment } = require('../utils/appointment')
const { matchClientsWithTherapists } = require('../utils/match');
const { createRating } = require('../utils/rating');
const { getRatingsAndClientDetails } = require('../utils/getRatings');
const { getFeedbacksAndTherapists } = require('../utils/getFeedbacks'); // Adjust the path as necessary
const { getMatchedTherapistsForUser } = require('../utils/fetchMatchedTherapists');
const updateUserPassword = require('../utils/updateUserPassword');
const verifyTherapist = require('../middleware/verifyTherapist');
const { generateVRToken } = require('../utils/generateVRToken');
const { generateToken } = require('../utils/azureHealthBot');
const { createConversation } = require('../utils/fixieAI');
const { updateResponses } = require('../utils/updateResponses');
const { getInteractionsByToken } = require('../utils/getInteractions');
const { getTokenByUserId } = require('../utils/getTokenByUserId');
const { getMatchedPatientsForTherapist } = require('../utils/fetchMatchedPatients');


//register
/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user and sends a verification email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phoneNumber
 *               - username
 *               - password
 *               - role
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 description: "User role (e.g., client, therapist)"
 *               responses:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       500:
 *         description: Error message
 */
router.post('/api/register', async (req, res) => {
  ;
  try {
    const { firstName, lastName, email, phoneNumber, username, password, role, responses } = req.body;
    const result = await registerUser(firstName, lastName, email, phoneNumber, username, password, role, responses);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: User login
 *     description: Logs in a user and returns a token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 userData:
 *                   type: object
 *       400:
 *         description: Email and password are required
 *       500:
 *         description: Error message
 */
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
/**
 * @swagger
 * /api/forgot-password:
 *   post:
 *     summary: Initiates a password reset process
 *     description: Sends a password reset token to the user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset token sent to email
 *       500:
 *         description: Error message
 */
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
/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     summary: Reset user's password
 *     description: Allows a user to reset their password using a token received via email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *                 description: "Reset token sent to user's email"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: "New password for the user"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       500:
 *         description: Error message
 */
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
/**
 * @swagger
 * /api/verify:
 *   get:
 *     summary: Verify new user
 *     description: Verifies a new user's email with a token sent to their email.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: Verification token sent to the user's email.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User verified successfully, redirects to the application URL.
 *       400:
 *         description: Verification token is required
 *       404:
 *         description: User not found or already verified
 *       500:
 *         description: Error message
 */
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
/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update user profile
 *     description: Allows authenticated users to update their profile information.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       500:
 *         description: Error message
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.put('/api/user/profile', authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, username, phoneNumber } = req.body;
    const imageFile = req.file;

    // Construct the updates object
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (username) updates.username = username;
    if (phoneNumber) updates.phoneNumber = phoneNumber;

    // Update the user's profile
    const result = await updateUserProfile(userId, updates, imageFile);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user details endpoint
/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get user details
 *     description: Retrieves details of the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       500:
 *         description: Error message
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
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
/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create a new appointment
 *     description: Allows authenticated users to create a new appointment.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentData:
 *                 type: object
 *                 required:
 *                   - date
 *                   - time
 *                   - reason
 *                   - description
 *                   - appointmentType
 *                   - therapistId
 *                   - status
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                   time:
 *                     type: string
 *                   reason:
 *                     type: string
 *                   description:
 *                     type: string
 *                   appointmentType:
 *                     type: string
 *                   therapistId:
 *                     type: string
 *                   status:
 *                     type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       500:
 *         description: Error message
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
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
/**
 * @swagger
 * /api/match:
 *   post:
 *     summary: Trigger the matching process
 *     description: Matches clients with therapists based on their profiles and preferences.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Matching process completed successfully
 *       500:
 *         description: Error message
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.post('/api/match', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const matches = await matchClientsWithTherapists(userId);
    res.status(200).json({ success: true, matches });
  } catch (error) {
    console.error('Error during matching process:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/ratings:
 *   post:
 *     summary: Submit a rating
 *     description: Allows authenticated users to submit a rating for a therapist.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 format: int32
 *                 description: Rating score
 *               review:
 *                 type: string
 *                 description: Review text
 *               therapistId:
 *                 type: string
 *                 description: ID of the therapist being rated
 *     responses:
 *       201:
 *         description: Rating submitted successfully
 *       500:
 *         description: Error message
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
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
/**
 * @swagger
 * /api/feedbacks:
 *   post:
 *     summary: Submit feedback
 *     description: Allows authenticated users to submit feedback with an optional file attachment.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               feedback:
 *                 type: string
 *                 description: Feedback text
 *               clientId:
 *                 type: string
 *                 description: Client ID associated with the feedback
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Optional file to accompany the feedback
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *       500:
 *         description: Error message
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
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
    const result = await createFeedback(userId, feedback, clientId, fileData);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Endpoint to get ratings and client details for a therapist
/**
 * @swagger
 * /api/therapist/ratings:
 *   get:
 *     summary: Get ratings and client details
 *     description: Retrieves ratings and corresponding client details for the authenticated therapist.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ratings and client details retrieved successfully
 *       500:
 *         description: Error message
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
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

// Endpoint to get feedbacks and therapists for a client
/**
 * @swagger
 * /api/client/feedbacks:
 *   get:
 *     summary: Get feedbacks and therapists
 *     description: Retrieves feedbacks and corresponding therapist details for the authenticated client.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feedbacks and therapists retrieved successfully
 *       500:
 *         description: Error message
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.get('/api/client/feedbacks', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming you have middleware to authenticate and add user info
    const feedbacksAndTherapists = await getFeedbacksAndTherapists(userId);
    res.status(200).json(feedbacksAndTherapists);
  } catch (error) {
    console.error('Error fetching feedbacks and therapists:', error);
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to get matched therapists for a user
/**
 * @swagger
 * /api/matched-therapists:
 *   get:
 *     summary: Get matched therapists
 *     description: Retrieves matched therapists for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Matched therapists retrieved successfully
 *       500:
 *         description: Error message
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.get('/api/matched-therapists', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Extracted from JWT token
    const matchedTherapists = await getMatchedTherapistsForUser(userId);
    res.status(200).json(matchedTherapists);
  } catch (error) {
    console.error('Error fetching matched therapists:', error);
    res.status(500).json({ message: error.message });
  }
});

//api to update user password for authenticated users without using an email
/**
 * @swagger
 * /api/user/change-password:
 *   put:
 *     summary: Change user password
 *     description: Allows authenticated users to change their password.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Incorrect old password
 *       404:
 *         description: User not found
 *       500:
 *         description: Error message
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.put('/api/user/change-password', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { oldPassword, newPassword } = req.body;

  try {
    // Retrieve the current user's hashed password from Firebase
    const userRef = db.ref(`users/${userId}`);
    const snapshot = await userRef.once('value');
    const user = snapshot.val();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect old password" });
    }

    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    await updateUserPassword(userId, hashedNewPassword);

    res.status(200).json({ message: "Your password has been successfully updated" });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: error.message });
  }
});

//generate VR Tokens
/**
 * @swagger
 * /api/generate-vr-token:
 *   post:
 *     summary: Generate VR token
 *     description: Generates a VR token for authenticated and verified therapists, linked to a specific user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user for whom the token is being generated.
 *     responses:
 *       200:
 *         description: VR token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       500:
 *         description: Error message
 */
router.post('/api/generate-vr-token', authenticateToken, verifyTherapist, async (req, res) => {
  try {
    const { userId } = req.body;
    const therapistId = req.user.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const token = await generateVRToken(userId, therapistId);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to generate a token for the Azure Health Bot
/**
 * @swagger
 * /api/chatBot:
 *   post:
 *     summary: Generate token for Azure Health Bot
 *     description: Generates a token for interacting with the Azure Health Bot.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               userName:
 *                 type: string
 *               locale:
 *                 type: string
 *               lat:
 *                 type: number
 *               long:
 *                 type: number
 *     responses:
 *       200:
 *         description: Token generated successfully
 *       500:
 *         description: Error message
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.post('/api/chatBot', authenticateToken, async (req, res) => {
  const { userId, userName, locale, lat, long } = req.body;

  try {
    const result = await generateToken(userId, userName, locale, lat, long);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/fixie/conversation:
 *   post:
 *     summary: Create conversation
 *     description: Initiates a conversation with Fixie AI.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               generateInitialMessage:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Conversation created successfully
 *       500:
 *         description: Error message
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.post('/api/fixie/conversation', async (req, res) => {
  const { message, generateInitialMessage } = req.body;

  try {
    const result = await createConversation(message, generateInitialMessage);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to update user responses
/**
 * @swagger
 * /api/user/updateResponses:
 *   put:
 *     summary: Update user responses
 *     description: Updates the responses for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               responses:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *     responses:
 *       200:
 *         description: Responses updated successfully
 *       500:
 *         description: Error message
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.put('/api/user/updateResponses', authenticateToken, async (req, res) => {
  const userId = req.user.userId; // Extracted from JWT token
  const { responses } = req.body;
  try {
    await updateResponses(userId, responses);
    res.status(200).json({ success: true, message: 'Responses updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/interactions/{userId}:
 *   get:
 *     summary: Retrieve interactions for a user
 *     description: Returns a list of interactions based on the user ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user to retrieve interactions for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved interactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: object
 *                 properties:
 *                   object:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: No interactions found
 *       500:
 *         description: Server error
 */
router.get('/api/interactions/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const token = await getTokenByUserId(userId);
    const interactions = await getInteractionsByToken(token);
    res.status(200).json(interactions);
  } catch (error) {
    if (error.message === 'No interactions found for this user.' || error.message === 'No active token found for this user.') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Endpoint to get matched patients for a therapist
router.get('/api/matched-patients', authenticateToken, async (req, res) => {
  try {
      const therapistId = req.user.userId;
      const matchedPatients = await getMatchedPatientsForTherapist(therapistId);
      res.status(200).json(matchedPatients);
  } catch (error) {
      console.error('Error fetching matched patients:', error);
      res.status(500).json({ message: error.message });
  }
});


module.exports = router;
