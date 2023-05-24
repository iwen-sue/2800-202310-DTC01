require("./utils.js");
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const mongoDBSession = require('connect-mongodb-session')(session);
// const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const usersModel = require('./models/user.js');
const groupsModel = require('./models/group.js');
const ejs = require('ejs');
const crypto = require('crypto');




const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


const multer = require('multer');  // npm install multer
const storage = multer.memoryStorage(); // store the file in memory as a buffer
const upload = multer({ storage: storage }); // specify the storage option

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

const app = express();

const port = process.env.PORT || 3000;


// socket.io dependencies
const server = require('http').Server(app);
const socketio = require('socket.io');
const io = socketio(server)

const Joi = require("joi");
const { ConnectionClosedEvent } = require("mongodb");


//control the strength of the password
const saltRounds = 6;

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

var { database } = include('databaseConnection');
const { GridFSBucket } = require('mongodb');
const db = database.db(mongodb_database); // Replace 'your_database_name' with the actual database name

// Create a new GridFSBucket instance using the gridFSBucket() method
const bucket = new GridFSBucket(db);

const groupCollection = database.db(mongodb_database).collection('groups');
const userCollection = database.db(mongodb_database).collection('users');


//declare we use ejs res.render will use ejs the ejs files created under views
app.set('view engine', 'ejs');

//false: url decode only support array or string
app.use(express.urlencoded({ extended: true }))

const store = new mongoDBSession({
    // uri: 'mongodb://127.0.0.1:27017/connect_mongodb_session_test',
    uri: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}?retryWrites=true&w=majority`,
    collection: "sessions",
    crypto: {
        secret: mongodb_session_secret
    }
});

app.use(session({
    secret: node_session_secret,
    store: store, //default is memory store 
    saveUninitialized: false,
    resave: true
}
));

// middleware function starts
function isValidSession(req) {
    if (req.session.authenticated) {
        return true;
    }
    return false;
}

function sessionValidation(req, res, next) {
    if (isValidSession(req)) {
        next();
    }
    else {
        res.redirect('/');
    }
}


function isAdmin(req) {
    if (req.session.type == 'admin') {
        return true;
    }
    return false;
}

function adminAuthorization(req, res, next) {
    if (!isAdmin(req)) {
        res.status(403);
        res.render("errorMessage", { error: "Not Authorized" });
        return;
    }
    else {
        next();
    }
}
// middleware function finishes

app.use('/', (req, res, next) => {  // for local variables
    next();
});

app.get('/', (req, res) => {
    if (req.session.authenticated) {
        res.redirect('/home');
    } else {
        res.render("index");
    }
});


// app.use('/', sessionValidation)

app.get('/home', sessionValidation, async (req, res) => {
    const userEmail = req.session.email;
    try {
      const query = await usersModel.findOne({ email: userEmail });
      const groupID = query.groupID;
      const groupQuery = await groupsModel.findOne({ _id: groupID });
  
      if (groupQuery) {
        const groupName = groupQuery.groupName;
  

        const itineraryQuery = await groupsModel.findById(groupID, 'itinerary');
        const itinerary = itineraryQuery.itinerary;

        res.render('itinerary', { groupName: groupName + "'s Itinerary", itinerary: JSON.stringify(itinerary) });
      } else {
        res.render('itinerary', { groupName: "Join a group First!" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred.' });
    }
  });
  
// This is to pass the itinerary data to the client side 
app.get('/itineraryData', sessionValidation, async (req, res) => {
    const userEmail = req.session.email;
    try {
      const query = await usersModel.findOne({ email: userEmail });
      const groupID = query.groupID;
      const groupQuery = await groupsModel.findOne({ _id: groupID });
  
      if (groupQuery) {
        const itineraryQuery = await groupsModel.findById(groupID, 'itinerary');
        const itinerary = itineraryQuery.itinerary;
  
        res.json({ itinerary }); // Send the itinerary data as JSON response
      } else {
        res.status(404).json({ error: "Group not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred.' });
    }
  });
  


app.get('/chatroom', sessionValidation, async (req, res) => {
    const query = usersModel.findOne({
        email: req.session.email,
    });
    query.then((docs) => {
        var docs = docs
        const groupQuery = groupsModel.findOne({
            _id: docs.groupID
        })
        groupQuery.then((groupInfo) => {
            let userObj = new Object();
            userObj.name = docs.firstName + ' ' + docs.lastName;
            userObj.email = docs.email
            userObj.userID = docs._id;
            if (docs.profilePic) {
                userObj.profilePic = docs.profilePic
            }
            res.render("chatroom", { group: groupInfo, user: userObj });
        })


    }).catch((err) => {
        console.error(err);
    });
});

app.get('/userprofile', sessionValidation, async (req, res) => {
    const query = usersModel.findOne({
        email: req.session.email,
    });
    query.then((docs) => {
        res.render("userprofile", { user: docs });

    }).catch((err) => {
        console.error(err);
    });
});

const bucketlist = require('./controller/enterBucket.js');
const toHistory = require('./controller/toHistory.js');
const editBucket = require('./controller/editBucket.js');
const deleteBucket = require('./controller/deleteBucket.js');

app.post('/enterBucket', bucketlist)
app.post('/toHistory', toHistory)
app.post('/editBucket', editBucket)
app.post('/deleteBucket', deleteBucket)


// const multer = require('multer');  // npm install multer
// const memoryStorage = multer.memoryStorage(); // store the file in memory as a buffer
// const upload = multer({ storage: memoryStorage }); // specify the storage option
const editProfile = require('./controller/editProfile.js');
const { Server } = require("net");
const { json } = require("body-parser");
app.post('/editProfile', editProfile);

app.get('/editBucket', (req, res) => {
    const query = usersModel.findOne({
        email: req.session.email,
    });
    const cardID = req.query.cardID;
    query.then((docs) => {
        docs.bucketlist.forEach((card) => {
            if (card._id == cardID) {
                res.render("editBucket", { card: card });
            }
        }
        )
    }).catch((err) => {
        console.error(err);
    }
    );

});

app.get('/enterBucket', (req, res) => {
    res.render("enterBucket");
});
app.get('/userprofile/travel_history', (req, res) => {
    const query = usersModel.findOne({
        email: req.session.email,
    });
    query.then((docs) => {

        res.render("travel_history", { travelHistory: docs.travelHistory });

    }).catch((err) => {
        console.error(err);
    });
});

app.get('/signup', (req, res) => {
    if (req.query.groupToken != null) {
        res.render("signup", { groupToken: req.query.groupToken });
    }
    else {
        res.render("signup", { groupToken: null });
    }
});

app.get('/login', (req, res) => {
    if (req.query.groupToken !== null) {
        res.render("login", { groupToken: req.query.groupToken });
    }
    else {
        res.render("login", { groupToken: null });
    }
});

app.get('/forgotPassword', (req, res) => {
    res.render('forgotPassword.ejs'); // Render the forgotPassword.ejs template
});


app.get('/resetPassword', async (req, res) => {
    console.log(req.query.token);
    const user = await usersModel.findOne({ resetToken: req.query.token }).exec();
    console.log(user)
    console.log(req.query.token === null)
    if (!user || !req.query.token) {
        res.redirect('/home');
    } else {
        res.render('resetPassword', { email: user.email, token: req.query.token });
    }

});

app.get('/logout', sessionValidation, (req, res) => {
    req.session.destroy(function (err) {
        // res.clearCookie(this.cookie, { path: '/' });
        res.redirect('/');
    });
});


//static images address
app.use(express.static(__dirname + "/public"));

app.post('/signup', async (req, res) => {
    try {
        // Check if all required fields are present
        if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password) {
            // Render the signup page with an error message
            return res.render('signup', { error: 'MissingFields', groupToken: req.body.groupToken });
        }
        console.log(req.body.groupToken, 'groupToken')
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        var userType
        if (req.body.groupToken != null) {
            userType = 'member'
            var group = await groupsModel.find({ _id: req.body.groupToken }).exec();
            var currentMembers = group[0].members;
            var memberHasJoinedPreviously = false;
            for (var i = 0; i < currentMembers.length; i++) {
                if (currentMembers[i].email == req.body.email) {
                    memberHasJoinedPreviously = true;
                }
            }
            if (memberHasJoinedPreviously) {
                for(var i = 0; i < currentMembers.length; i++){
                    if(currentMembers[i].email == req.body.email){
                        currentMembers[i].active = true;
                    }
                }
                await groupsModel.updateOne({ _id: groupID }, { $set: { members: currentMembers[0].members } }).exec();
            }
            else {
                await groupsModel.updateOne({ _id: req.body.groupToken }, {
                    $push: {
                        members: {
                            email: req.body.email,
                            type: 'member',
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            active: true
                        }
                    }
                }).exec();
            }
        }
        const user = new usersModel({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
            groupID: req.body.groupToken,
            type: userType
        });
        await user.save();
        req.session.authenticated = true;
        req.session.firstName = req.body.firstName;
        req.session.lastName = req.body.lastName;
        req.session.password = hashedPassword;
        req.session.email = req.body.email;
        req.session.cookie.maxAge = 2147483647;
        res.redirect('/home');
    } catch (error) {
        console.error(error);
        res.render("signup", { error: "Try use another email that is already exists", groupToken: req.body.groupToken });
    }
});



app.post('/login', async (req, res) => {
    var password = req.body.password;
    var email = req.body.email;
    const groupToken = req.body.groupToken;

    const schema = Joi.string().max(30).required();
    const validationResult = schema.validate(email);
    if (validationResult.error != null) {
        var error = "Invalid email format. Please enter a valid email address.";
        return res.render("login", { error: error, errorType: 'InvalidEmailFormat', groupToken: groupToken });
    }

    const result = await usersModel.find({ email: email }).select('email type firstName lastName password profilePic _id').exec();

    if (result.length == 0) {
        var error = "User is not found";
        return res.render("login", { error: error, errorType: 'UserNotFound', groupToken: groupToken });
    }
    if (await bcrypt.compare(password, result[0].password)) {
        console.log("password is correct");
        req.session.authenticated = true;
        req.session.lastName = result[0].lastName;
        req.session.firstName = result[0].firstName;
        req.session.password = result[0].password;
        req.session.email = result[0].email;
        req.session.cookie.maxAge = 2147483647;
        if (groupToken != null) {
            var group = await groupsModel.find({ _id: req.body.groupToken }).exec();
            var currentMembers = group[0].members;
            var memberHasJoinedPreviously = false;
            for (var i = 0; i < currentMembers.length; i++) {
                if (currentMembers[i].email == req.body.email) {
                    memberHasJoinedPreviously = true;
                }
            }
            if (memberHasJoinedPreviously) {
                for(var i = 0; i < currentMembers.length; i++){
                    if(currentMembers[i].email == email){
                        currentMembers[i].active = true;
                    }
                }
                await groupsModel.updateOne({ _id: groupToken }, { $set: { members: currentMembers } }).exec();
            }
            else {
                await groupsModel.updateOne({ _id: groupToken }, {
                    $push: {
                        members: {
                            email: result[0].email,
                            type: 'member',
                            firstName: result[0].firstName,
                            lastName: result[0].lastName,
                            profilePic: result[0].profilePic,
                            active: true
                        }
                    }
                }).exec();
            }
            await usersModel.updateOne({ email: result[0].email }, { $set: { groupID: groupToken, type: 'member' } }).exec();
        }
        res.redirect('/home');
    }
    else {
        var error = "Password is not correct";
        return res.render("login", { error: error, errorType: 'IncorrectPassword', groupToken: groupToken });
    }
});


app.post('/forgotPassword', async (req, res) => {
    try {
        const email = req.body.email;
        console.log(email)
        const user = await usersModel.findOne({ email: email }).exec();
        if (!user) {
            return res.render('forgotPassword', { error: 'UserNotFound' });
        }
        const resetToken = crypto.randomBytes(20).toString('hex');


        const resetTokenExpiry = Date.now() + 3600000; // Expiration in 1 hour
        const expiryDate = new Date(resetTokenExpiry);


        console.log(expiryDate)

        user.resetToken = resetToken;
        user.resetTokenExpiration = expiryDate;



        await user.save().then(async () => {
            res.render('forgotPassword', { success: 'Email is successfully sent.' });
        }).catch((err) => {
            console.log(err);
        });


        setTimeout(async () => {
            await usersModel.updateOne({ email: email }, { $unset: { resetTokenExpiration: 1 } });
        }, 3600000);

        const transporter = nodemailer.createTransport({
            service: 'hotmail',
            auth: {
                user: 'vacapal@outlook.com',
                pass: 'comp2800!'
            }
        });
        const resetUrl = `http://${process.env.APP_DOMAIN}/resetPassword?token=${resetToken}`;
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL,
            subject: 'Reset your password on Vacapal',
            html: `Hi ${user.firstName} ${user.lastName} \n
            Please click on the following link, or paste this into your browser to complete the process:\n
            <a href="${resetUrl}">here</a>\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };
        await transporter.sendMail(mailOptions);
        res.render('forgotPassword', { success: 'EmailSent' });
    } catch (error) {
        console.error(error);
        res.render('forgotPassword', { error: 'Error' });
    }
});

app.post('/resetPassword', async (req, res) => {
    try {
        const token = req.body.token;
        const email = req.body.email;
        console.log(email);

        const newPassword = req.body.password;
        const confirmPassword = req.body.confirmPassword;

        if (newPassword !== confirmPassword) {
            return res.render('resetPassword', { error: 'PasswordNotMatch', token: token, email: email });
        } else {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await usersModel.findOneAndUpdate({ resetToken: token }, { password: hashedPassword }).exec();
            return res.render('login', { success: 'Password is succesfully reset. Please try log in again' })
        }
    } catch (error) {
        console.error(error);
        return res.render('resetPassword', { error: 'Error', token: req.body.token, email: req.body.email });
    }
});

//static images address
app.use(express.static(__dirname + "/public"));

app.get('/creategroup', sessionValidation, (req, res) => {
    res.render("creategroup", { error: null });
});

app.post('/groupconfirm', sessionValidation, async (req, res) => {
    var groupName = req.body.groupName;
    const schema = Joi.string().max(20).required();
    const validationResult = schema.validate(groupName);
    if (validationResult.error != null) {
        var error = "Group name is too long. Please enter a group name that is 20 characters or less.";
        return res.render("creategroup", { error: error });
    }
    const currentUser = await usersModel.findOne({ email: req.session.email }).exec();
    const newGroup = new groupsModel({
        groupName: groupName,
        members: [
            {
                email: currentUser.email,
                type: 'leader',
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                profilePic: currentUser.profilePic,
                active: true
            }
        ]
    });
    await newGroup.save();
    const group = await groupsModel.findOne({ groupName: groupName }).exec();
    await usersModel.updateOne({ email: req.session.email }, { $set: { groupID: group._id, type: 'leader' } }).exec();
    res.render("groupconfirm", { groupName: req.body.groupName });
});

app.get('/userprofile/groupdetails', sessionValidation, async (req, res) => {
    var currentUser = await usersModel.findOne({ email: req.session.email }).exec()
    const group = await groupsModel.findOne({ _id: currentUser.groupID }).exec()
    try {
        var allMembers = group.members
        res.render("groupdetails", { user: currentUser, group: allMembers, groupName: group.groupName, groupID: group._id });

    } catch (err) {
        console.log(err)
        res.redirect("/userprofile")
    }
});

app.post('/invite', sessionValidation, async (req, res) => {
    var inviteEmail = req.body.inviteeEmail;
    const userName = req.session.firstName + " " + req.session.lastName;
    const groupToken = req.body.groupID
    const inviteMessage = {
        from: process.env.EMAIL,
        to: inviteEmail,
        subject: 'You have been invited to join a group on VacaPal!',
        html: `<h1>You have been invited by ${userName} to join their group on VacaPal!</h1>
        <p>Click <a href="http://${process.env.APP_DOMAIN}/signup?groupToken=${groupToken}">here</a> to sign up and join the group!</p>
        <p>If you already have an account, click <a href="http://${process.env.APP_DOMAIN}/login?groupToken=${groupToken}">here</a> to log in and join the group!</p>
        <p>Or, enter this token in your profile after clicking "Join Group": <b>${groupToken}</b></p>
        <p>Thank you for using VacaPal!</p>
        `
    }

    transporter.sendMail(inviteMessage, (err, info) => {
        if (err) {
            res.render('emailconfirmation', { error: err });
            console.log(err);
        } else {
            res.render('emailconfirmation', { error: null });
            console.log(info.response);
        }
    });
});

app.post('/removemember', sessionValidation, async (req, res) => {
    var memberEmail = req.body.memberEmail;
    var groupID = req.body.groupID;
    // await groupsModel.updateOne({ _id: groupID }, { $pull: { members: { email: memberEmail } } }).exec();
    var currentMembers = await groupsModel.find({ _id: groupID }).exec();
    for(var i = 0; i < currentMembers[0].members.length; i++){
        if(currentMembers[0].members[i].email == memberEmail){
            currentMembers[0].members[i].active = false;
        }
    }
    await groupsModel.updateOne({ _id: groupID }, { $set: { members: currentMembers[0].members } }).exec();
    await usersModel.updateOne({ email: memberEmail }, { $set: { groupID: null, type: null } }).exec();
    res.redirect('/userprofile/groupdetails');
});

app.post('/joingroup', sessionValidation, async (req, res) => {
    var groupToken = req.body.groupToken;
    var currentUser = await usersModel.findOne({ email: req.session.email }).exec();
    var group = await groupsModel.find({ _id: req.body.groupToken }).exec();
    var currentMembers = group[0].members;
    var memberHasJoinedPreviously = false;
    for (var i = 0; i < currentMembers.length; i++) {
        if (currentMembers[i].email == req.session.email) {
            memberHasJoinedPreviously = true;
        }
    }
    if (memberHasJoinedPreviously) {
        for(var i = 0; i < currentMembers.length; i++){
            if(currentMembers[i].email == req.session.email){
                currentMembers[i].active = true;
            }
        }
        await groupsModel.updateOne({ _id: groupToken }, { $set: { members: currentMembers } }).exec();
    }
    else {
        await groupsModel.updateOne({ _id: groupToken }, {
            $push: {
                members: {
                    email: currentUser.email,
                    type: 'member',
                    firstName: currentUser.firstName,
                    lastName: currentUser.lastName,
                    profilePic: currentUser.profilePic,
                    active: true
                }
            }
        }).exec();
    }

    await usersModel.updateOne({ email: req.session.email }, { $set: { groupID: groupToken, type: 'member' } }).exec();
    res.redirect('/userprofile/groupdetails');
});

app.post('/leavegroup', sessionValidation, async (req, res) => {
    var groupID = req.body.groupID;
    var currentMembers = await groupsModel.find({ _id: groupID }).exec();
    for(var i = 0; i < currentMembers[0].members.length; i++){
        if(currentMembers[0].members[i].email == req.session.email){
            currentMembers[0].members[i].active = false;
        }
    }
    await groupsModel.updateOne({ _id: groupID }, { $set: { members: currentMembers[0].members } }).exec();
    await usersModel.updateOne({ email: req.session.email }, { $set: { groupID: null, type: null } }).exec();
    res.redirect('/userprofile');
});

app.post('/deletegroup', sessionValidation, async (req, res) => {
    var groupID = req.body.groupID;
    await groupsModel.deleteOne({ _id: groupID }).exec();
    await usersModel.updateMany({ groupID: groupID }, { $set: { groupID: null, type: null } }).exec();
    res.redirect('/userprofile');
});

app.get('/chatroom/sentimentScores', sessionValidation, async (req, res) => {
    var groupID = req.query.id
    groupsModel.findOne({ _id: groupID }).then((docs) => {
        res.status(200).json({ data: docs.memberSentiment });
    })
})

app.post('/uploadImage', sessionValidation, upload.single('imageData'), async (req, res) => {
    const imageData = req.file;

    if (imageData) {

        res.status(200).json({ message: 'Image uploaded successfully', imageData: imageData.buffer });
    } else {
        res.status(404).json({ message: 'File not found' });
    }

})



app.post('/itinerary/submitNew', sessionValidation, async (req, res) => {
    
    var citiesArray = JSON.parse(req.body.cities);
    const categories = [
        "Sightseeing",
        "Outdoor Adventure",
        "Cultural Experience",
        "Food and Dining",
        "Shopping",
        "Entertainment",
        "Nature Exploration",
        "Relaxation"
    ];
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const country = req.body.country;
    const cities = citiesArray
    const promptArgs = `Make an itinerary at ${cities} in ${country} from ${startDate} to ${endDate}, around ${startTime} to ${endTime} in a format {date :, schedule: [{"startTime":,"endTime":, "category":, "activity":, "transportation":  transportation with estimated time }]}, Make an object for each date in JSON format that is in an array. Assign dates properly in only one city considering distance. Include recommended transportation for each activity. Use the following categories to categorize each activity: ${categories}`;
    console.log("Generating itinerary...");
    const userEmail = req.session.email;
    const query = await usersModel.findOne({ email: userEmail });
    const groupID = query.groupID;


    let itinerary; // Declare itinerary variable outside the promise chain

    try {
      itinerary = await generateItinerary(promptArgs);
      const parsedItinerary = JSON.parse(itinerary);
      await saveItinerary(parsedItinerary, groupID);
      res.json({ itinerary: parsedItinerary });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "An error occurred" });
    }
    
    async function saveItinerary(itineraryJSON, groupID) {
        // Delete the existing itinerary array
        await groupsModel.updateOne({ _id: groupID }, { $unset: { itinerary: 1 } }).exec();
        
        // Create a new itinerary array and push the new itinerary into it
        const update = { $push: { itinerary: { $each: itineraryJSON } } };
        await groupsModel.updateOne({ _id: groupID }, update).exec();
      }
      
    
    async function generateItinerary(promptArgs) {
      const res = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: promptArgs }],
        temperature: 0.3,
      });
      console.log(res.data.choices[0].message.content)
    
      return res.data.choices[0].message.content; // Return the parsed object directly
    }
});
  


app.post('/itinerary/getRecommendation', sessionValidation, (req, res) => {
    console.log(req.body)
})

app.post('/itinerary/adjustment', sessionValidation, (req, res)=>{
    console.log(req.body)
})

app.post('/itinerary/edit', sessionValidation, (req, res)=>{
    console.log(req.body)
    console.log(JSON.parse(req.body.schedule))
})

app.post('/itinerary/delete', sessionValidation, (req, res)=>{
    console.log(req.body)
    console.log(JSON.parse(req.body.deleteSchedule))
})

//static images address
app.use(express.static(__dirname + "/public"));
// handle 404 - page not found
// must put this in the very last otherwise it will catch all routes as 404
app.get("*", (req, res) => {
    res.status(404);
    res.render("404");
})

// socketio part starts
let memory = [];  // store user input for AI's memory
let lastActivityTimeSTP = null;  // last activity time stamp
io.on('connection', socket => {
    socket.on('joinedRoom', (joinedRoomObj) => {
        console.log(joinedRoomObj.name, " joined room ")
        socket.join(joinedRoomObj.groupID);
        let message = joinedRoomObj.name + ' has joined the chat'

        //broadcast when a user connect, to everyone except the client connecting
        //notify who enters the chatroom and who leaves the chatroom
        socket.broadcast.to(joinedRoomObj.groupID).emit('message', message);



    })

    socket.on('chatHistory', async (groupID) => {
        //save message to database
        messageHistory = await showChatHistory(groupID);
        //emit to the single user
        socket.emit('chatHistory', messageHistory);
    });

    //listen for chat message
    socket.on('chatMessage', async (chatMessageObj) => {
        var group = await groupsModel.findOne({ _id: chatMessageObj.groupID });
        const maxMessageHistory = 10;

        // set inactive threshold
        lastActivityTimeSTP = Date.now();
        const inactiveThreshold = 1000 * 60 * 5;  // 5 minutes
        setInterval(async () => {
            if (lastActivityTimeSTP && Date.now() - lastActivityTimeSTP > inactiveThreshold) {
                // user is inactive
                // console.log("user is inactive");
                if (memory.length > maxMessageHistory) {
                    memory = memory.slice(-maxMessageHistory);
                }
                await groupsModel.updateOne({ _id: chatMessageObj.groupID }, { $set: { chatContext: memory } });
            }
        }, 10000);  //Check every 10 seconds


        if (typeof chatMessageObj.message == 'string') {
            //save message to database
            saveMessage(chatMessageObj);
            io.to(chatMessageObj.groupID).emit('chatMessage', { chatMessageObj });

            let userMessage = `${chatMessageObj.userName}: ${chatMessageObj.message}`;
            console.log(userMessage);

            // check if there is chat log in the database
            if (group.chatContext.length > 0 && memory.length == 0) {
                console.log("chat log in the database");
                memory.push(...group.chatContext);  //need to be an array
            }

            const promptArgs = `Sentiment analyze this dialogue based on the dialogue you heard and provide me with only a JSON data in a format of {userName:${chatMessageObj.userName}, score:sentimentScore, email:${chatMessageObj.email} ,suggestion: give suggestion of how I can help out as a friend if the score is lower than 0.1, context: describe the context for the score, emoji: emoji in numeric character reference that fits the reason}}, nothing should be generated except for the JSON format data: \n\n` + userMessage + '\n\n';

            memory.push(userMessage);
            console.log(memory);

            // AI analysis
            const res = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "assistant", content: memory.join('') },
                    { role: "user", content: promptArgs },  // user input TODO
                ],
                temperature: 0.3,
            })
            let response = res.data.choices[0].message.content;

            // console.log(response);  // AI response
            try {
                jsonObj = JSON.parse(response);
                console.log(jsonObj);  // AI response in JSON format 

                //find the group
                var group = await groupsModel.findOne({ _id: chatMessageObj.groupID });
                var result = group.memberSentiment.find(member => member.email == jsonObj.email);
                if (result) {
                    await groupsModel.updateOne({ _id: chatMessageObj.groupID, "memberSentiment.email": jsonObj.email },
                        {
                            $set: {
                                "memberSentiment.$.score": jsonObj.score,
                                "memberSentiment.$.suggestion": jsonObj.suggestion,
                                "memberSentiment.$.context": jsonObj.context,
                                "memberSentiment.$.emoji": jsonObj.emoji
                            }
                        })

                } else {
                    group.memberSentiment.push(jsonObj);
                    await group.save();
                }
                const getSentiment = await groupsModel.findOne({ _id: chatMessageObj.groupID, "memberSentiment.email": jsonObj.email });
                const memberResult = getSentiment.memberSentiment.find(member => member.email == jsonObj.email);
                console.log(memberResult);
                socket.broadcast.to(chatMessageObj.groupID).emit('sentimentScore', { memberSentiment: memberResult });

            } catch (error) {
                console.log(error);
                // ignore error
            }

        } else {
            //user sent image data
            //do not save the image data into messages history
            // saveMessage(chatMessageObj);

            io.to(chatMessageObj.groupID).emit('chatMessage', { chatMessageObj });

        }
    })

    socket.on('moreChatHistory', async (groupID, numOfScroll) => {
        const getMoreMessageHistory = await showMoreChatHistory(groupID, numOfScroll);
        console.log(numOfScroll)
        if (getMoreMessageHistory.length == 0) {
            socket.emit('noMoreChatHistory', data = true);
        }
        if (numOfScroll > 0) {
            socket.emit('moreChatHistory', getMoreMessageHistory);

        }

    })

    socket.on('deleteMessage', async (groupID, timeStp, chatMessageText) => {
        await deleteMessageDB(groupID, timeStp, chatMessageText);
        socket.emit('deleteMessage', { groupID, timeStp, chatMessageText });
    });

}); // socketio part ends

async function deleteMessageDB(groupID, messagerName, chatMessageText) {
    try {
        const updateResult = await groupsModel.updateOne(
            { _id: groupID },
            { $pull: { messages: { message: chatMessageText, userName: messagerName } } }
        ).exec();

        if (updateResult.modifiedCount > 0) {
            console.log('Message deleted.');
        } else {
            console.log('Message not found.');
        }
    } catch (err) {
        console.log(err);
    }
}

async function saveMessage(chatMessageObj) {
    try {
        const group = await groupsModel.findOne({ _id: chatMessageObj.groupID });

        if (group) {
            console.log(chatMessageObj)

            // chatMessageObj._id = mongoose.

            const update = { $push: { messages: chatMessageObj } };
            await groupsModel.updateOne({ _id: chatMessageObj.groupID }, update)
            // await msg.insertOne(chatMessageObj);
            // await group.save();
            return group.messages;
        }
    } catch (error) {
        console.log(error);
    }
}


async function showMoreChatHistory(groupID, numOfScroll) {
    try {
        const group = await groupsModel.findOne({ _id: groupID });
        numOfScroll -= 1;
        const numOfMessages = group.messages.length;
        var modifyMessages = [];
        if (group) {
            if (numOfMessages == 15) {
                modifyMessages = [];
                console.log("when 15 msgs", modifyMessages)
            } else {
                modifyMessages = group.messages.reverse().slice(15 + 4 * numOfScroll, 15 + 4 * numOfScroll + 4);
                console.log("more than 15 msgs", modifyMessages)
            }
            return modifyMessages;
        }
    } catch (error) {
        console.log(error);
    }
}

async function showChatHistory(groupID) {
    try {
        const group = await groupsModel.findOne({ _id: groupID });
        if (group) {
            console.log(Array.isArray(group.messages))
            const modifyMessages = group.messages.slice(-15);

            return modifyMessages;
        }
    } catch (error) {
        console.log(error);
    }
}

server.listen(port, () => {
    console.log("Node application listening on port " + port);
});
