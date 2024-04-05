// utils/rating.js
const { admin, db } = require('./firebaseConfig');

const createRating = async (userId, ratingData) => {
  const ratingsRef = db.ref('ratings');

  // Create a new rating reference with a unique key
  const newRatingRef = ratingsRef.push();

  // Construct the rating object
  const newRating = {
    rating: ratingData.rating,
    review: ratingData.review,
    clientId: userId,
    therapistId: ratingData.therapistId,
  };

  // Save the rating to the database
  await newRatingRef.set(newRating);

  return { success: true, message: 'You have rated the therapist successfully', ratingId: newRatingRef.key };
};

module.exports = { createRating };