require('dotenv').config();
require("./utils.js");
const express = require('express');
// const session = require('express-session');
const groupModel = require('./models/group.js');
const router = express.Router();


const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);