require("./utils.js");
const express = require('express');
// const session = require('express-session');
const usersModel = require('./models/user.js');
const groupsModel = require('./models/group.js');
var { database } = include('databaseConnection');
const mongodb_database = process.env.MONGODB_DATABASE;
const groupCollection = database.db(mongodb_database).collection('groups');
const router = express.Router();

const multer = require('multer');  // npm install multer
const storage = multer.memoryStorage(); // store the file in memory as a buffer
const upload = multer({ storage: storage }); // specify the storage option

router.post('/editProfile', upload.single('avatar'), async (req, res) => {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var homeCity = req.body.homeCity;
    var email = req.body.email;

    const update = {
        $set: {
            firstName: firstName,
            lastName: lastName,
            email: email,
            profilePic: req.file ? req.file.buffer.toString('base64') : undefined,
            homeCity: homeCity
        }
    }


    const result = await usersModel.updateOne({
        email: req.session.email,
    }, update);



    if (result) {

        try {


            const query = usersModel.findOne({
                email: req.session.email,
            });

            query.then(async (docs) => {
                console.log(docs.groupID)
                if (docs.groupID) {
                    await groupsModel.updateOne(
                        { _id: docs.groupID, "members.email": email },
                        {
                          $set: {
                            "members.$.firstName": firstName,
                            "members.$.lastName": lastName,
                            "members.$.profilePic": req.file ? req.file.buffer.toString('base64') : undefined,
                          }
                        }
                      );
                }
                req.session.email = email;
                req.session.firstName = firstName;
                req.session.lastName = lastName;



                res.status(200);
                res.json(docs)
                res.end()
                // res.render("userprofile", { user: docs });
            }).catch((err) => {
                console.error(err);
            });

        } catch (err) {
            console.error(err)
            console.log(err)
        }
    }
})

module.exports = router;