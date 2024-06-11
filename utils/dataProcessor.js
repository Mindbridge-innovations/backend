// utils/dataProcessor.js
const { db } = require('./firebaseConfig');

const fetchInteractions = async () => {
  const interactionsRef = db.ref('interactions');
  const snapshot = await interactionsRef.once('value');
  const interactions = snapshot.val();
  return interactions;
};

const processData = (interactions) => {
  const data = [];

  for (const token in interactions) {
    for (const key in interactions[token]) {
      const interaction = interactions[token][key];
      const timestamp = new Date(interaction.timestamp).getTime();
      const date = new Date(interaction.timestamp);
      
      data.push({
        timestamp,
        hour: date.getUTCHours(),
        day: date.getUTCDay(),
        interval: null // To be computed
      });
    }
  }

  // Compute intervals between interactions
  for (let i = 1; i < data.length; i++) {
    data[i].interval = (data[i].timestamp - data[i - 1].timestamp) / 1000; // in seconds
  }

  // Normalize data
  const minTimestamp = Math.min(...data.map(d => d.timestamp));
  const maxTimestamp = Math.max(...data.map(d => d.timestamp));

  data.forEach(d => {
    d.timestamp = (d.timestamp - minTimestamp) / (maxTimestamp - minTimestamp);
  });

  return data;
};

module.exports = {
  fetchInteractions,
  processData
};
