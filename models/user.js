const mongoose = require("./../db");

const BucketlistSchema = new mongoose.Schema({
  country: String,
  city: String,
  description: String,
  travelImg: { type: Buffer, contentType: String },
});

const usersSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/, // regular expression for a valid email format
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  type: String,
  profilePic: Buffer,
  homeCity: String,
  groupID: String,
  travelHistory: [BucketlistSchema],
  bucketlist: [BucketlistSchema],
  resetToken: String,
  resetTokenExpiration: Number,
});

const usersModel = mongoose.model("users", usersSchema);

mongoose.connection.once("open", () => {
  usersModel.createIndexes();
});

module.exports = usersModel;
