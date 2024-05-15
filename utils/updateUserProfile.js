// utils/updateUserProfile.js
const { admin, db, storage } = require('./firebaseConfig');

const updateUserProfile = async (userId, updates, imageFile) => {
  const userRef = db.ref(`users/${userId}`);

  try {
    if (imageFile) {
      // Upload the image to Firebase Storage
      const imageRef = storage.ref(`profileImages/${userId}/${imageFile.originalname}`);
      await imageRef.put(imageFile.buffer);
      // Get URL of the uploaded image and update the profileImage field
      const imageUrl = await imageRef.getDownloadURL();
      updates.profileImage = imageUrl;
    }

    // Update the user's profile information in the database
    await userRef.update(updates);
    return { success: true, message: 'User profile updated successfully' };
  } catch (error) {
    console.error(`Error updating user profile: ${error.message}`);
    throw error;
  }
};

module.exports = updateUserProfile;