require("../utils.js");
const express = require('express');
// const session = require('express-session');
const usersModel = require('../models/user.js');
const router = express.Router();

const multer = require('multer');  // npm install multer
const storage = multer.memoryStorage(); // store the file in memory as a buffer
const upload = multer({ storage: storage }); // specify the storage option



router.post('/editBucket',upload.single('avatar'), async (req, res) => {
    const query = usersModel.findOne({
        email: req.session.email,
    });
    const cardID = req.body.cardID
    const condition = { "bucketlist._id": cardID };
    const update = {
        $set: {
            "bucketlist.$.description": req.body.description,
            "bucketlist.$.travelImg": req.file? req.file.buffer.toString('base64'): undefined,
        }
    };
    const options = { upsert: true };
    const result = await query.exec();
    result.bucketlist.forEach(async (item) => {
        if (item._id == cardID) {
            await usersModel.updateOne(condition, update, options);
        }
    }
    );
    // res.redirect('/userprofile');

});

module.exports = router;