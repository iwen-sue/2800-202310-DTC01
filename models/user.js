const mongoose = require('mongoose');
require('dotenv').config();
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;

mongoose.connect(`mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}`, {
  useNewUrlParser: true,
//   useUnifiedTopology: true,
}).then(
    () => {
        console.log("Connected to MongoDB successfully!");
    },
    err => {
        console.log("Connection to MongoDB failed!" + err);
    }
);

const usersSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        match: /^\S+@\S+\.\S+$/, // regular expression for a valid email format
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    type: String,
    profilePic: String,
    homeCity: String,
    groupID: String,
    bucketlist: {
        country: String,
        city: String,
        description: String,
        countryImg: String,
    }
});

const usersModel = mongoose.model('users', usersSchema);

mongoose.connection.once('open', () => {
    usersModel.createIndexes();
  });

module.exports = usersModel;
