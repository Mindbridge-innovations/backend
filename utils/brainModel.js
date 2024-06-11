// utils/brainModel.js
const brain = require('brain.js');
const net = new brain.NeuralNetwork({
  hiddenLayers: [10, 10] // Example of a more complex architecture
});

// Function to train the model
const trainModel = (data) => {
  const formattedData = data.map(d => ({
    input: [d.timestamp, d.hour / 24, d.day / 7, d.interval],
    output: [d.timestamp] // Example output; adjust based on your specific target
  }));

  net.train(formattedData, {
    iterations: 2000,
    errorThresh: 0.005,
    log: true,
    logPeriod: 100,
    learningRate: 0.01
  });
};

// Function to make predictions
const predict = (input) => {
  return net.run([input.timestamp, input.hour / 24, input.day / 7, input.interval]);
};

module.exports = {
  trainModel,
  predict
};
