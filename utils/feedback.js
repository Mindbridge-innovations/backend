// utils/feedback.js
const { db } = require('./firebaseConfig');
const { getStorage } = require('firebase-admin/storage');

const createFeedback = async (userId, feedback, clientId, fileData) => {
  const storage = getStorage();
  const feedbacksRef = db.ref('feedbacks');
  const newFeedbackRef = feedbacksRef.push();

  let fileUrl = null;
  if (fileData) {
    const { fileBuffer, fileName, mimeType } = fileData;
    // Create a reference to the file location in the storage bucket
    const fileRef = storage.bucket().file(`feedbacks/${newFeedbackRef.key}/${fileName}`);
    // Upload the file buffer to Firebase Storage
    await fileRef.save(fileBuffer, { contentType: mimeType });
    // Get the download URL of the uploaded file
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-09-2491', // Far future date
    });
    fileUrl = url;
  }

  // Construct the feedback object
  const newFeedback = {
    therapistId: userId,
    feedback:feedback,
    fileUrl: fileUrl, // This will be null if no file was uploaded
    clientId:clientId,
  };
  

  // Save the feedback to the database
  await newFeedbackRef.set(newFeedback);

  return { success: true, message: 'Feedback submitted successfully', feedbackId: newFeedbackRef.key };
};

module.exports = { createFeedback };