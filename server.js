const express = require('express');
require('dotenv').config();
const {firebaseApp} = require("./utils/firebaseConfig") 


const db = getDatabase(firebaseApp);

const port = process.env.PORT || 3000;

const app = express()

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
   });