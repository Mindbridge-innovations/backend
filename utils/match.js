// utils/match.js
const { getDatabase, ref, get, query, orderByChild, equalTo,child } = require('firebase/database');
const { firebaseApp } = require('./firebaseConfig');



// Function to calculate the score based on responses
const calculateMatchScore = (clientResponses, therapistResponses) => {
  let score = 0;

  // Score for language compatibility
  const sharedLanguages = clientResponses.languages.filter(language =>
    therapistResponses.languages.includes(language)
  );
  score += sharedLanguages.length * 10; // Assign 10 points for each shared language

  // Score for communication preferences
  const sharedCommunicationMethods = clientResponses.communication.filter(method =>
    therapistResponses.communication.includes(method)
  );
  score += sharedCommunicationMethods.length * 5; // Assign 5 points for each shared communication method

  // Score for therapy experiences
  const matchingTherapyExperiences = clientResponses.therapy_experiences.filter(experience =>
    therapistResponses.therapy_experiences.includes(experience)
  );
  score += matchingTherapyExperiences.length * 15; // Assign 15 points for each matching therapy experience

  return score;
};

// Function to match clients with therapists
const matchClientsWithTherapists = async () => {
  const db = getDatabase(firebaseApp);
  const usersRef = ref(db, 'users');
  const responsesRef = ref(db, 'responses');
  const matchesRef = ref(db, 'matches');

  // Retrieve all therapists and clients
  const therapistsSnapshot = await get(query(usersRef, orderByChild('role'), equalTo('therapist')));
  const clientsSnapshot = await get(query(usersRef, orderByChild('role'), equalTo('client')));

  if (!therapistsSnapshot.exists() || !clientsSnapshot.exists()) {
    throw new Error('No therapists or clients found');
  }

  const therapists = therapistsSnapshot.val();
  const clients = clientsSnapshot.val();

  // Create an array to store potential matches
  let potentialMatches = [];

  // Calculate scores for each client-therapist pair
  for (const clientId in clients) {
    const clientResponsesSnapshot = await get(ref(responsesRef, clientId));
    const clientResponses = clientResponsesSnapshot.val();

    for (const therapistId in therapists) {
      const therapistResponsesSnapshot = await get(ref(responsesRef, therapistId));
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
    const therapistMatchesRef = push(ref(matchesRef, therapistId));
    await set(therapistMatchesRef, matches[therapistId]);
  }

  return matches;
};

module.exports = { matchClientsWithTherapists };