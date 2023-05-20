require("./utils.js");
const express = require('express');
const usersModel = require('./models/user.js');
const router = express.Router();

router.post('/deleteBucket', async (req, res) => {
    const result = await usersModel.findOne({
        email: req.session.email,
    });

    result.bucketlist.forEach(async (item) => {
        if (item._id == req.body.cardID) {
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