// utils/getRating.js
const { db } = require('./firebaseConfig');

const getRatingsAndClientDetails = async (therapistId) => {
    const ratingsRef = db.ref('ratings');
    const usersRef = db.ref('users');
    const ratingsSnapshot = await ratingsRef.orderByChild('therapistId').equalTo(therapistId).once('value');
    const ratings = ratingsSnapshot.val();

    if (!ratings) {
        return []; // Return an empty array if no ratings are found
    }

    const clientDetailsPromises = Object.keys(ratings).map(async (key) => {
      const clientId = ratings[key].clientId;
      const clientSnapshot = await usersRef.child(clientId).once('value');
      const clientDetails = clientSnapshot.val();

      return {
        rating: ratings[key],
        clientDetails,
      };
    });

    const ratingsAndClients = await Promise.all(clientDetailsPromises);
    return ratingsAndClients.reverse(); // Correctly call reverse()
};

module.exports = { getRatingsAndClientDetails };