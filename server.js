const express = require('express');
require('dotenv').config();
const cors = require('cors');

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

const app = express()

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
   });