require("./utils.js");
const express = require('express');
// const session = require('express-session');
const usersModel = require('./models/user.js');
const router = express.Router();

router.post('/editBucket', async (req, res) => {
    const result = await usersModel.findOne({
        email: req.session.email,
    });

});

module.exports = router;