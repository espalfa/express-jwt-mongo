const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

const db = require("./app/models");
const dbConfig = require("./app/config/db.config");
const envModes = require("./app/config/enviroment.config");
const dotenv = require('dotenv');


var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// database
db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  }); 

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to espalfa application." });
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

// set port, listen for requests
const PORT = 3000;
dotenv.config();
console.log('env: ', process.env.NODE_ENV);
if( process.env.NODE_ENV === "test"){
  console.log(`Server will run on port ${PORT}.`);
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
}

