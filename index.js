require("./utils.js");
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoDBSession = require('connect-mongodb-session')(session);
// const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const usersModel = require('./models/user.js');
const groupsModel = require('./models/group.js');
const ejs = require('ejs');

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

const app = express();
app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT || 3000;

const Joi = require("joi");


const expireTime = 60 * 60 * 1000;

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

const groupCollection = database.db(mongodb_database).collection('groups');
const userCollection = database.db(mongodb_database).collection('users');

//declare we use ejs res.render will use ejs the ejs files created under views
app.set('view engine', 'ejs');

//false: url decode only support array or string
app.use(express.urlencoded({ extended: false }))

const store = new mongoDBSession({
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
        res.redirect('/login');
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

app.get('/', (req, res) => {
    if (isValidSession(req)) {
        res.redirect('/home');
    }
    else {
        res.render("index");
    }
});

app.get('/home', sessionValidation,(req, res) => {
    res.render("home");
});

app.get('/userprofile', (req,res) => {
    res.render("userprofile");
});

app.get('/signup', (req, res) => {
    console.log(req.query.groupToken)
    if (req.query.groupToken != null) {
        console.log("groupToken: " + req.query.groupToken);
        res.render("signup", { groupToken: req.query.groupToken });
    }
    else {
        res.render("signup", { groupToken: null });
    }
});

app.get('/login', (req, res) => {
    res.render("login");
});

app.post('/signup', async (req, res) => {
    try {
        // Check if all required fields are present
        if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password) {
            // Render the signup page with an error message
            return res.render('signup', { error: 'MissingFields' });
        }
        console.log(req.body.groupToken, 'groupToken')
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        var userType
        if (req.body.groupToken != null) {
            userType = 'member'
            await groupsModel.updateOne({ _id: req.body.groupToken }, { $push: { members: req.body.email } }).exec();
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
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.redirect('/signup?error=ServerError');
    }
});

app.post('/login', async (req, res) => {
    var password = req.body.password;
    var email = req.body.email;

    const schema = Joi.string().max(30).required();
    const validationResult = schema.validate(email);
    if (validationResult.error != null) {
        var error = "Invalid email format. Please enter a valid email address.";
        return res.render("login", { error: error, errorType: 'InvalidEmailFormat' });
    }
    
    const result = await usersModel.find({ email: email }).select('email type firstName lastName password _id').exec();

    if (result.length == 0) {
        var error = "User is not found";
        return res.render("login", { error: error, errorType: 'UserNotFound' });
    }
    if (await bcrypt.compare(password, result[0].password)) {
        req.session.authenticated = true;
        req.session.lastName = result[0].lastName;
        req.session.firstName = result[0].firstName;
        req.session.password = result[0].password;
        req.session.email = result[0].email;
        req.session.cookie.maxAge = expireTime;

        res.redirect('/home');
    }
    else {
        var error = "Password is not correct";
        return res.render("login", { error: error, errorType: 'IncorrectPassword' });
    }
});

app.get('/creategroup', sessionValidation,(req, res) => {
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
    const newGroup = new groupsModel({
        groupName: groupName,
        members: [req.session.email]
    });
    await newGroup.save();
    const group = await groupsModel.findOne({ groupName: groupName }).exec();
    await usersModel.updateOne({ email: req.session.email }, { $set: { groupID: group._id, type: 'leader' } }).exec();
    res.render("groupconfirm", { groupName: req.body.groupName});
});

app.get('/userprofile/groupdetails', sessionValidation, async (req, res) => {
    var currentUser = await usersModel.findOne({ email: req.session.email }).exec()
    const group = await groupsModel.findOne({ _id: currentUser.groupID }).exec()
    var allMembers = group.members

    const memberNames = allMembers.map(async (member) => {
        member = await usersModel.findOne({ email: member }).exec()
        return member.firstName + " " + member.lastName;
    })
    Promise.all(memberNames).then((memberNames) => {
        res.render("groupdetails", { user: currentUser, group: memberNames, groupName: group.groupName, groupID: group._id, confirmation: null });
    }, (err) => {
        console.log(err)
    })
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
        <p>Click <a href="http://localhost:3000/signup?groupToken=${groupToken}">here</a> to sign up and join the group!</p>`
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
    // res.redirect('/userprofile/groupdetails');
});
//static images address
app.use(express.static(__dirname + "/public"));
// handle 404 - page not found
// must put this in the very last otherwise it will catch all routes as 404
app.get("*", (req, res) => {
    res.status(404);
    res.render("404");
})
app.listen(port, () => {
    console.log("Node application listening on port " + port);
});
