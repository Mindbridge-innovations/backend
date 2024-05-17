// utils/updateUserProfile.js
const { db } = require('./firebaseConfig');
const { getStorage } = require('firebase-admin/storage');


const updateUserProfile = async (userId, updates, imageFile) => {
  const userRef = db.ref(`users/${userId}`);
  const storage = getStorage();

  try {
    if (imageFile) {
      const imageRef = storage.bucket().file(`profileImages/${userId}/${imageFile.originalname}`);
      await imageRef.save(imageFile.buffer, {
        contentType: imageFile.mimetype
      });

      const [url] = await imageRef.getSignedUrl({
        action: 'read',
        expires: '03-09-2491'
      });

      updates.profileImage = url;
    }

    await userRef.update(updates);
    return { success: true, message: 'User profile updated successfully' };
  } catch (error) {
    console.error(`Error updating user profile: ${error.message}`);
    return { success: false, message: error.message };  // Send error message back to client
  }
};
module.exports = updateUserProfile;