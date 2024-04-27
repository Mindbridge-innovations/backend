const { db } = require('./firebaseConfig');

const getFeedbacksAndTherapists = async (clientId) => {
    const feedbacksRef = db.ref('feedbacks');
    const usersRef = db.ref('users');

    // Fetch feedbacks where clientId matches the given clientId
    const feedbacksSnapshot = await feedbacksRef.orderByChild('clientId').equalTo(clientId).once('value');
    const feedbacks = feedbacksSnapshot.val();

    if (!feedbacks) {
        console.log("No feedbacks found for this client.");
        return [];
    }

    // For each feedback, fetch the therapist details
    const feedbacksWithTherapistPromises = Object.keys(feedbacks).map(async (key) => {
        const therapistId = feedbacks[key].therapistId;
        const therapistSnapshot = await usersRef.child(therapistId).once('value');
        const therapistDetails = therapistSnapshot.val();

        return {
            feedback: feedbacks[key],
            therapistDetails,
        };
    });

    const feedbacksAndTherapists = await Promise.all(feedbacksWithTherapistPromises);
    return feedbacksAndTherapists;
};
module.exports = { getFeedbacksAndTherapists };