require("./utils.js");
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoDBSession = require('connect-mongodb-session')(session);
// const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const usersModel = require('./models/user.js');
const ejs = require('ejs');

const app = express();

const port = process.env.PORT || 3000;

const Joi = require("joi");




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
    console.log("req.session: " + JSON.stringify(req.session));
    next();
});

app.get('/', (req, res) => {
    if (req.session.authenticated) {
        res.render("home")
    }else{
        res.render("index");
    }
});


// app.use('/', sessionValidation)

app.get('/home', sessionValidation, (req, res) => {
    res.render("home");
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

const bucketlist = require('./enterBucket.js');
const toHistory = require('./toHistory.js');
app.post('/enterBucket', bucketlist)
app.post('/toHistory', toHistory)
app.get('/enterBucket', (req, res) => {
    res.render("enterBucket");
});
app.get('/userprofile/travel_history', (req, res) => {
    res.render("travel_history");
});

// app.get('/userprofile', sessionValidation, async (req,res) => {
//     const result = await usersModel.findOne({ email: req.session.email });
//     var bucketlist = result.bucketlist;
//     var travelHistory = result.travelHistory;
//     res.render("userprofile", {user: req.session, bucketlist: bucketlist, travelHistory: travelHistory});
// });

app.get('/signup', (req, res) => {
    res.render("signup");
});

app.get('/login', (req, res) => {
    res.render("login");
});

//Test Post
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
            return res.render('signup', { error: 'MissingFields' });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new usersModel({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword
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
        res.render("signup", { error: "Try use another email that is already exists" });
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
        console.log("password is correct");
        req.session.authenticated = true;
        req.session.lastName = result[0].lastName;
        console.log("req.session.lastName: " + req.session.lastName)
        req.session.firstName = result[0].firstName;
        req.session.password = result[0].password;
        req.session.email = result[0].email;
        req.session.bucketlist = result[0].bucketlist[0];
        req.session.cookie.maxAge = 2147483647;

        res.redirect('/home');
    }
    else {
        var error = "Password is not correct";
        return res.render("login", { error: error, errorType: 'IncorrectPassword' });
    }
});

app.post('/editProfile', async (req, res) => {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var homeCity = req.body.homeCity;
    var email = req.body.email;
    var profilePic = req.body.avatar

    const result = await usersModel.findOne({
        email: req.session.email,
    });

    const update = {
        $set: {
            firstName: firstName,
            lastName: lastName,
            email: email,
            profilePic: profilePic,
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
                res.status(200);
                res.json(docs)
                res.redirect("/userprofile");
            }).catch((err) => {
                console.error(err);
            });

        } catch (err) {
            console.error(err)
            console.log(err)
        }
    }


})

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
