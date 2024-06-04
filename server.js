//server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./routes/router');
const { swaggerSpec, swaggerUi } = require('./swagger');

const port = process.env.PORT || 3000;
const app = express()

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (err, req, res, next) {
  res
    .status(err.status || 500)
    .send({ message: err.message, stack: err.stack });
});

//routes
app.use('/v1', router);

// Serve Swagger docs at /docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
   });