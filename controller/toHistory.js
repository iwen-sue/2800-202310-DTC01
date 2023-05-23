require("../utils.js");
const express = require('express');
const usersModel = require('../models/user.js');
const router = express.Router();

router.post('/toHistory', async (req, res) => {
    const result = await usersModel.findOne({
        email: req.session.email,
    });

    result.bucketlist.forEach(async (item) => {
        if (item._id == req.body.bucketID) {
            await usersModel.updateOne({ email: req.session.email }, {
                $push: {
                    travelHistory: {
                        country: item.country,
                        city: item.city,
                        description: item.description,
                        travelImg: item.travelImg,
                    }
                }
            });
            await usersModel.updateOne({ email: req.session.email }, {
                $pull: {
                    bucketlist: {
                        _id: item._id,
                    }
                }
            });
        }

    });


    res.redirect('/userprofile');

});

module.exports = router;