require("./utils.js");
const express = require('express');
// const session = require('express-session');
const usersModel = require('./models/user.js');
const groupsModel = require('./models/group.js');
const router = express.Router();

const multer = require('multer');  // npm install multer
const storage = multer.memoryStorage(); // store the file in memory as a buffer
const upload = multer({ storage: storage }); // specify the storage option

router.post('/editProfile', upload.single('avatar'), async (req, res) => {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var homeCity = req.body.homeCity;
    var email = req.body.email;
    console.log(req.file)


    const result = await usersModel.findOne({
        email: req.session.email,
    });
    var imageBase = req.file? req.file.buffer.toString('base64'): undefined
    

    const update = {
        $set: {
            firstName: firstName,
            lastName: lastName,
            email: email,
            profilePic:  req.file? req.file.buffer.toString('base64'): undefined,
            homeCity: homeCity
        }
    }

    

    if (result) {

        try {
            await usersModel.updateMany({ email: req.session.email }, update);
            req.session.email = email;
            req.session.firstName = firstName;
            req.session.lastName = lastName;

            const query = usersModel.findOne({
                email: req.session.email,
            });

            query.then((docs) => {
                if(docs.groupID){

                     groupsModel.updateMany(
                        {_id: docs.groupID },
                        { $set: { 
                            "members.$[element].profilePic": imageBase,
                            "members.$[element].firstName": firstName,
                            "members.$[element].lastName": lastName
                         } },
                        { arrayFilters: [{ "element.email": email }] }
                        );
                }
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