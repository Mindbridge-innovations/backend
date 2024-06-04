// swagger.js 
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'MINDBRIDGE API DOCUMENTATION',
    version: '1.0.0',
    description: 'This is the MindBridge API documentation made with Express and documented with Swagger',
  },
  servers: [
    {
        url: 'https://backend-production-0710.up.railway.app/v1',
        description: 'Production server',
      },
    {
      url: 'http://localhost:3000/v1',
      description: 'Development server',
    }
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./routes/*.js'],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec, swaggerUi };