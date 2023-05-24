const mongoose = require('mongoose');
require('dotenv').config();
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;

const itinerarySchema = new mongoose.Schema({
    date: mongoose.Schema.Types.Mixed,
    schedule: [
      {
        startTime: mongoose.Schema.Types.Mixed,
        endTime: mongoose.Schema.Types.Mixed,
        category: String,
        activity: String,
        transportation: String
      }
    ]
  });

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
    messages: [
        {
          messageName: mongoose.Schema.Types.Mixed,
          message: mongoose.Schema.Types.Mixed,
          groupID: mongoose.Schema.Types.Mixed,
          userID: mongoose.Schema.Types.Mixed,
          userName: String,
          timeStp: mongoose.Schema.Types.Mixed,
          email: mongoose.Schema.Types.Mixed
        }
      ],
    memberSentiment: {
        type: Array,  // username, sentiment score, emoji, timestmp
    },
    chatContext: {
        type: Array, 
    },
    itinerary: [itinerarySchema]
});

const groupsModel = mongoose.model('groups', groupsSchema);

module.exports = groupsModel;