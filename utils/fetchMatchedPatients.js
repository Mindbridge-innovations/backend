const { db } = require('./firebaseConfig');

const getMatchedPatientsForTherapist = async (therapistId) => {
    const matchesRef = db.ref('matches');
    const usersRef = db.ref('users');
    const responsesRef = db.ref('responses');  // Assuming responses are stored under a 'responses' node

    // Fetch all matches where the current therapist is involved
    const matchesSnapshot = await matchesRef.child(therapistId).once('value');
    const patientIds = matchesSnapshot.val() || [];

    const patientDetailsPromises = patientIds.map(async (patientId) => {
        const patientSnapshot = await usersRef.child(patientId).once('value');
        const patientData = patientSnapshot.val();

        // Fetch responses for the patient
        const responsesSnapshot = await responsesRef.child(patientId).once('value');
        const patientResponses = responsesSnapshot.val();

        return {
            patientId,
            ...patientData,
            responses: patientResponses || {},  // Include responses or an empty object if none exist
        };
    });

    const patients = await Promise.all(patientDetailsPromises);
    return patients;
};

module.exports = {
    getMatchedPatientsForTherapist
};