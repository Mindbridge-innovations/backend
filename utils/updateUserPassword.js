//utils/updateUserPasswors.js
const { db } = require('./firebaseConfig');

const updateUserPassword = async (userId, hashedPassword) => {
    try {
        await db.ref(`users/${userId}`).update({
            password: hashedPassword
        });
    return { success: true, message: 'Your password has been updated successfully' };

    } catch (error) {
        console.error('Failed to update user password:', error);
        throw error; // Rethrow or handle as needed
    }
}

module.exports = updateUserPassword;