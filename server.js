const bodyParser = require('body-parser');
const { firebaseApp } = require('./utils/firebaseConfig'); // Update the path
const { initializeApp } = require("firebase/app");
const router = require('./routes/router');


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

app.use('/v1', router);

const port = process.env.PORT || 3000;

const app = express()

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
   });