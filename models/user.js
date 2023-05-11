const mongoose = require('mongoose');
const bucketlistSchema = new mongoose.Schema({
    country: String,
    city: String,
    ExpectedDate: Date,
    todo: String,
    countryImg: String,
});


const usersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        match: /^\S+@\S+\.\S+$/, // regular expression for a valid email format
        required: true
    },
    password: {
        type: String,
        required: true
    },
    type: "user",
    profilePic: String,
    homeCountry: String,
    groupID: String,
    bucketlist: bucketlistSchema
});

const usersModel = mongoose.model('users', usersSchema);
const bucketlistModel = mongoose.model('bucketlist', bucketlistSchema);

module.exports = usersModel;
module.exports = bucketlistModel;