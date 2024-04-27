const { db } = require('./firebaseConfig');

const getMatchedTherapistsForUser = async (userId) => {
    const matchesRef = db.ref('matches');
    const usersRef = db.ref('users');
    const responsesRef = db.ref('responses');
    const ratingsRef = db.ref('ratings');  // Reference to the ratings in your Firebase database

    // Fetch all matches
    const matchesSnapshot = await matchesRef.once('value');
    const allMatches = matchesSnapshot.val();
    if (!allMatches) {
        console.log("No matches found.");
        return [];
    }

    // Filter to find therapists that have the current user's ID listed
    const matchedTherapistsPromises = Object.keys(allMatches).map(async (therapistId) => {
        const userMatches = allMatches[therapistId];
        if (userMatches.includes(userId)) {
            const therapistSnapshot = await usersRef.child(therapistId).once('value');
            const therapistDetails = therapistSnapshot.val();

            // Fetch responses associated with the therapist
            const responsesSnapshot = await responsesRef.child(therapistId).once('value');
            const responses = responsesSnapshot.val();

            // Fetch ratings and calculate the average
            const ratingsSnapshot = await ratingsRef.orderByChild('therapistId').equalTo(therapistId).once('value');
            const ratings = ratingsSnapshot.val();
            let averageRating = 0;
            if (ratings) {
                const total = Object.values(ratings).reduce((acc, { rating }) => acc + rating, 0);
                averageRating = parseFloat((total / Object.values(ratings).length).toFixed(1));
            }

            return {
                therapistId,
                ...therapistDetails,
                responses: responses || {},  // Include responses or an empty object if none exist
                averageRating  // Include the average rating
            };
        }
        return null;
    });

    const matchedTherapists = (await Promise.all(matchedTherapistsPromises)).filter(therapist => therapist !== null);
    return matchedTherapists;
};

module.exports = {
    getMatchedTherapistsForUser
};