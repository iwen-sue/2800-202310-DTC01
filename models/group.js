const mongoose = require('mongoose');
require('dotenv').config();
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;

// mongoose.connect(`mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}?retryWrites=true&w=majority`).then(
//     () => {
//         console.log("Connected to MongoDB successfully! in group schema");
//     },
//     err => {
//         console.log("Connection to MongoDB failed! in group schema" + err);
//     }
// );

const groupsSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true,
        unique: true
    },
    members: {
        type: Array,
        required: true
    }, 
    messages: {
        type: Array,
    }
});

const groupsModel = mongoose.model('groups', groupsSchema);

module.exports = groupsModel;
