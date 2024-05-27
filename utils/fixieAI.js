// utils/fixieAI.js
const axios = require('axios');
require('dotenv').config();

const createConversation = async (message, generateInitialMessage = true) => {
  const data = JSON.stringify({
    message,
    metadata: {},
    runtimeParameters: {},
    generateInitialMessage
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${process.env.FIXIE_AI_URL}`,
    headers: { 
      'Content-Type': 'application/json', 
      'Accept': 'application/jsonl',
      'Authorization': `Bearer ${process.env.FIXIE_AI_TOKEN}`
      
    },
    data
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Error in creating conversation with Fixie AI:', error);
    throw error;
  }
};

module.exports = { createConversation };