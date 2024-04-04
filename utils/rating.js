// utils/ratingd.js
const { getDatabase, ref, set,push } = require('firebase/database');
const { firebaseApp } = require('./firebaseConfig');

const createRating = async (userId, ratingData) => {
  const db = getDatabase(firebaseApp);
  const ratingsRef = ref(db, 'ratings');

  // Create a new rating reference with a unique key
  const newRatingRef = push(ratingsRef);

  // Construct the rating object
  const newRating = {
    rating: ratingData.rating,
    review: ratingData.review,
    clientId:userId,
    therapistId: ratingData.therapistId,
  };

  // Save the rating to the database
  await set(newRatingRef, newRating);

  return { success: true, message: 'You have rated therapist successfully', ratingId: newRatingRef.key };
};

module.exports = { createRating };