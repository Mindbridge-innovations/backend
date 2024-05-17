// utils/updateUserProfile.js
const { db } = require('./firebaseConfig');
const { getStorage } = require('firebase-admin/storage');


const updateUserProfile = async (userId, updates, imageFile) => {
  const userRef = db.ref(`users/${userId}`);
  const usernamesRef = db.ref('usernames');
  const storage = getStorage();

  try {
    const currentUserSnapshot = await userRef.once('value');
    const currentUserData = currentUserSnapshot.val();

    console.log('Current Username:', currentUserData.username);
    console.log('New Username:', updates.username);

    if (updates.username && updates.username !== currentUserData.username) {
      const newUsernameSnapshot = await usernamesRef.child(updates.username).once('value');
      if (newUsernameSnapshot.exists()) {
        throw new Error('Username already taken');
      }

      await usernamesRef.child(currentUserData.username).remove()
        .catch(error => console.error('Error removing old username:', error));

      await usernamesRef.child(updates.username).set({ userId: userId })
        .catch(error => console.error('Error setting new username:', error));
    }

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
    throw error;
  }
};
module.exports = updateUserProfile;