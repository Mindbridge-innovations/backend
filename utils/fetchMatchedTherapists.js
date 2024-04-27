// utils/match.js
const { db } = require('./firebaseConfig');

const getMatchedTherapistsForUser = async (userId) => {
    const matchesRef = db.ref('matches');
    const usersRef = db.ref('users');
    const responsesRef = db.ref('responses');

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

            return {
                therapistId,
                ...therapistDetails,
                responses: responses || {}  // Include responses or an empty object if none exist
            };
        }
        return null;
    });

    const matchedTherapists = (await Promise.all(matchedTherapistsPromises)).filter(therapist => therapist !== null);
    return matchedTherapists;
};

module.exports = { getMatchedTherapistsForUser };