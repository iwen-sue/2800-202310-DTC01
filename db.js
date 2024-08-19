const mongoose = require('mongoose');
require('dotenv').config();
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;

mongoose.connect(`mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}`, {
  useNewUrlParser: true
}).then(
    () => {
        console.log("Connected to MongoDB successfully!");
    },
    err => {
        console.log("Connection to MongoDB failed!" + err);
    }
);

module.exports = mongoose;