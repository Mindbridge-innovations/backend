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
const matchClientsWithTherapists = async (requestingClientId) => {
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

  // Retrieve existing matches if any
  const existingMatchesSnapshot = await matchesRef.once('value');
  const existingMatches = existingMatchesSnapshot.val() || {};

  // Process each client
  let potentialMatches = [];
  for (const clientId in clients) {
    const client = clients[clientId];
    if (clientId !== requestingClientId) continue; // Only process the requesting client

    // If client is already matched and requesting a new match, remove from current match
    if (client.isMatched) {
      for (const therapistId in existingMatches) {
        const index = existingMatches[therapistId].indexOf(clientId);
        if (index > -1) {
          existingMatches[therapistId].splice(index, 1); // Remove client from previous therapist's list
          await matchesRef.child(therapistId).set(existingMatches[therapistId]); // Update the database
          break;
        }
      }
    }

    const clientResponsesSnapshot = await responsesRef.child(clientId).once('value');
    const clientResponses = clientResponsesSnapshot.val();

    for (const therapistId in therapists) {
      if (client.doNotMatchTherapistIds && client.doNotMatchTherapistIds.includes(therapistId)) {
        continue; // Skip therapists in the do not match list
      }

      const therapistResponsesSnapshot = await responsesRef.child(therapistId).once('value');
      const therapistResponses = therapistResponsesSnapshot.val();

      const score = calculateMatchScore(clientResponses, therapistResponses);
      potentialMatches.push({ clientId, therapistId, score });
    }
  }

  // Sort potential matches by score
  potentialMatches.sort((a, b) => b.score - a.score);

  const matches = {};
  const matchedClients = new Set(); // Keep track of clients that have been matched

  potentialMatches.forEach(match => {
    if (matchedClients.has(match.clientId)) {
      return;
    }

    if (!matches[match.therapistId]) {
      matches[match.therapistId] = [];
    }

    // Ensure the therapist does not have more than 5 clients
    if (matches[match.therapistId].length < 5) {
      matches[match.therapistId].push(match.clientId);
      matchedClients.add(match.clientId); // Mark this client as matched

      // Update the client's isMatched field and doNotMatchTherapistIds list
      const updatedClientData = {
        isMatched: true,
        doNotMatchTherapistIds: [...(clients[match.clientId].doNotMatchTherapistIds || []), match.therapistId]
      };
      usersRef.child(match.clientId).update(updatedClientData);
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