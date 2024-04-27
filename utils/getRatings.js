// utils/getRating.js
const { db } = require('./firebaseConfig');

const getRatingsAndClientDetails = async (therapistId) => {
    const ratingsRef = db.ref('ratings');
    const usersRef = db.ref('users');
    const ratingsSnapshot = await ratingsRef.orderByChild('therapistId').equalTo(therapistId).once('value');
    const ratings = ratingsSnapshot.val();
  
    if (!ratings) {
      console.log("No ratings found for this therapist.");
      return [];
    }
  
    console.log("Ratings found:", ratings);
  
    const clientDetailsPromises = Object.keys(ratings).map(async (key) => {
      const clientId = ratings[key].clientId;
    //   console.log("Fetching details for clientId:", clientId);
      const clientSnapshot = await usersRef.orderByChild('userId').equalTo(clientId).once('value');
      const clientDetails = clientSnapshot.val();
  
      if (!clientDetails) {
        console.log(`No details found for client with ID: ${clientId}`);
      } else {
        console.log(`Details found for client ${clientId}:`, clientDetails);
      }
  
      return {
        rating: ratings[key],
        clientDetails,
      };
    });
  
    const ratingsAndClients = await Promise.all(clientDetailsPromises);
    return ratingsAndClients;
  };

  module.exports={getRatingsAndClientDetails};