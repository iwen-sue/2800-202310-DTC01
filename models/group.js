const mongoose = require('mongoose');
require('dotenv').config();
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;

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
    },
    memberSentiment: {
        type: Array,  // username, sentiment score, emoji, timestmp
    },
});

const groupsModel = mongoose.model('groups', groupsSchema);

module.exports = groupsModel;
