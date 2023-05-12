require("./utils.js");
const express = require('express');
// const session = require('express-session');
const usersModel = require('./models/user.js');
const router = express.Router();

router.post('/enterBucket', async (req, res) => {
    const result = await usersModel.findOne({
        email: req.session.email,
    });
    if (result) {
        await usersModel.updateOne({ email: req.session.email }, {
            $push: {
                bucketlist: {
                    country: req.body.country,
                    city: req.body.city,
                    ExpectedDate: req.body.ExpectedDate,
                    description: req.body.description,
                }
            }
        });
        res.redirect('/userprofile');
        
    }

});

module.exports = router;