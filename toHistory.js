require("./utils.js");
const express = require('express');
const usersModel = require('./models/user.js');
const router = express.Router();

router.post('/toHistory', async (req, res) => {
    const result = await usersModel.findOne({
        email: req.session.email,
    });

    result.bucketlist.forEach(async (item) => {
        if (item.country == req.body.country && item.city == req.body.city) {
            await usersModel.updateOne({ email: req.session.email }, {
                $push: {
                    travelHistory: {
                        country: item.country,
                        city: item.city,
                    }
                }
            });
            await usersModel.updateOne({ email: req.session.email }, {
                $pull: {
                    bucketlist: {
                        country: item.country,
                        city: item.city,
                    }
                }
            });
        }

    });


    res.redirect('/userprofile');

});

module.exports = router;