require("../utils.js");
const express = require('express');
const usersModel = require('../models/user.js');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage(); // store the file in memory as a buffer
const upload = multer({ storage: storage }); // specify the storage option

router.post('/editBucket',upload.single('avatar'), async (req, res) => {
    //cath the data user sent with the help of multer, store it in database.
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
});

module.exports = router;