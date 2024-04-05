// utils/match.js
const { admin, db } = require('./firebaseConfig');



// Function to calculate the score based on responses
const calculateMatchScore = (clientResponses, therapistResponses) => {
  let score = 0;

  // Check if both client and therapist responses are valid
  if (!clientResponses || !therapistResponses) {
    return score;
  }

  // Score for language compatibility
  if (clientResponses.languages && therapistResponses.languages) {
    const sharedLanguages = clientResponses.languages.filter(language =>
      therapistResponses.languages.includes(language)
    );
    score += sharedLanguages.length * 10; // Assign 10 points for each shared language
  }

  // Score for communication preferences
  if (clientResponses.communication && therapistResponses.communication) {
    const sharedCommunicationMethods = clientResponses.communication.filter(method =>
      therapistResponses.communication.includes(method)
    );
    score += sharedCommunicationMethods.length * 5; // Assign 5 points for each shared communication method
  }

  // Score for therapy experiences
  if (clientResponses.therapy_experiences && therapistResponses.therapy_experiences) {
    const matchingTherapyExperiences = clientResponses.therapy_experiences.filter(experience =>
      therapistResponses.therapy_experiences.includes(experience)
    );
    score += matchingTherapyExperiences.length * 15; // Assign 15 points for each matching therapy experience
  }

  return score;
};

// Function to match clients with therapists
const matchClientsWithTherapists = async () => {
  const usersRef = db.ref('users');
  const responsesRef = db.ref('responses');
  const matchesRef = db.ref('matches');

  // Retrieve all therapists and clients
  const therapistsSnapshot = await usersRef.orderByChild('role').equalTo('therapist').once('value');
  const clientsSnapshot = await usersRef.orderByChild('role').equalTo('client').once('value');

  if (!therapistsSnapshot.exists() || !clientsSnapshot.exists()) {
    throw new Error('No therapists or clients found');
  }

  const therapists = therapistsSnapshot.val();
  const clients = clientsSnapshot.val();

  // Create an array to store potential matches
  let potentialMatches = [];

  // Calculate scores for each client-therapist pair
  for (const clientId in clients) {
    const clientResponsesSnapshot = await responsesRef.child(clientId).once('value');
    const clientResponses = clientResponsesSnapshot.val();

    for (const therapistId in therapists) {
      const therapistResponsesSnapshot = await responsesRef.child(therapistId).once('value');
      const therapistResponses = therapistResponsesSnapshot.val();

      const score = calculateMatchScore(clientResponses, therapistResponses);
      potentialMatches.push({ clientId, therapistId, score });
    }
  }

  // Sort potential matches by score
  potentialMatches.sort((a, b) => b.score - a.score);

  // Distribute clients to therapists, ensuring no therapist has more than 5 clients
  // and that clients are evenly distributed
  const matches = {};
  potentialMatches.forEach(match => {
    if (!matches[match.therapistId]) {
      matches[match.therapistId] = [];
    }
    if (matches[match.therapistId].length < 5) {
      matches[match.therapistId].push(match.clientId);
    }
  });

  // Save the matches to the database
  for (const therapistId in matches) {
    const therapistMatchesRef = matchesRef.child(therapistId);
    await therapistMatchesRef.set(matches[therapistId]);
  }

  return matches;
};

module.exports = { matchClientsWithTherapists };