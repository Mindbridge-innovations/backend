const { db } = require('./firebaseConfig');
const { getStorage } = require('firebase-admin/storage');
const { hashPassword } = require('./hash');



const updateUserProfile = async (userId, updates, imageFile) => {
  const userRef = db.ref(`users/${userId}`);
  const usernamesRef = db.ref('usernames');
  const storage = getStorage();

  try {
    const currentUserSnapshot = await userRef.once('value');
    const currentUserData = currentUserSnapshot.val();

    // If there's a new password, hash it
  if (updates.password) {
    updates.password=await hashPassword(updates.password)
  }

    // Check if username is being updated and handle accordingly
    if (updates.username && updates.username !== currentUserData.username) {
      const newUsernameSnapshot = await usernamesRef.child(updates.username).once('value');
      if (newUsernameSnapshot.exists() && newUsernameSnapshot.val().userId !== userId) {
        throw new Error('Username already taken');
      }

      // Remove old username entry if it exists
      if (currentUserData.username) {
        await usernamesRef.child(currentUserData.username).remove();
      }

      // Set new username with userId
      await usernamesRef.child(updates.username).set({ userId: userId });
    }

    // Handle profile image update
    if (imageFile) {
      // Delete existing image if it exists
      if (currentUserData.profileImage) {
        const existingImageRef = storage.bucket().file(currentUserData.profileImage);
        await existingImageRef.delete().catch(error => console.error('Failed to delete old image:', error));
      }

      // Upload new image
      const imageRef = storage.bucket().file(`profileImages/${userId}/${imageFile.originalname}`);
      await imageRef.save(imageFile.buffer, {
        contentType: imageFile.mimetype
      });

      // Get the download URL of the uploaded file
      const [url] = await imageRef.getSignedUrl({
        action: 'read',
        expires: '03-09-2491'
      });

      // Update the profile image URL in the updates object
      updates.profileImage = url;
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