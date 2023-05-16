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

    var imageBase = req.file? req.file.buffer.toString('base64'): undefined;


    const result = await usersModel.findOne({
        email: req.session.email,
    });

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


                    groupsModel.findOne({ _id: docs.groupID }).then(group => {
                        const filteredMembers = group.members.filter(member => {
                          if (member.email === email) {
                            member.profilePic = imageBase;
                            member.firstName = firstName;
                            member.lastName = lastName;
                            return true; // Keep the object in the filtered array
                          }
                          return false; // Exclude the object from the filtered array
                        });
                      
                        group.members = filteredMembers;
                        return group.save(); // Call .save() on the document itself
                      }).then(savedGroup => {
                        // The group has been saved successfully
                        console.log("Group saved:", savedGroup);
                      }).catch(error => {
                        // An error occurred
                        console.error("Error saving group:", error);
                      });

                        
                    
                    

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