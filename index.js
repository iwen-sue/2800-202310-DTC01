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
app.use(express.urlencoded({ extended: false }));

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
    res.render("index");
});

app.get('/home', (req, res) => {
    res.render("home");
});

app.get('/userprofile', (req,res) => {
    res.render("userprofile");
});

app.get('/signup', (req, res) => {
    res.render("signup");
});

app.get('/login', (req, res) => {
    res.render("login");
});

//Test Post

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
        req.session.lastName = req.body.lastName;
        req.session.firstName = req.body.firstName;
        req.session.password = hashedPassword;
        req.session.email = req.body.email;
        req.session.cookie.maxAge = Infinity;
        res.redirect('/home');
    } catch (error) {
        console.error(error);
        res.render("signup", { error: "Try use another email that is already exists" });
    }
});




// app.post('/signup', async (req, res) => {

//     try {
//         console.log("hit signup post")
//         const hashedPassword = await bcrypt.hash(req.body.password, 10);
//         console.log("hashedPassword: " + hashedPassword);
//         console.log("req.body.email: " + req.body.email);
//         const user = new usersModel({
//             firstName: req.body.firstName,
//             lastName: req.body.lastName,
//             email: req.body.email,
//             password: hashedPassword
//         });
//         await user.save();
//         res.redirect('/login');
//     } catch {
//         res.redirect('/signup');
//     }
// }
// );



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
        req.session.cookie.maxAge = Infinity;

        res.redirect('/home');
    }
    else {
        var error = "Password is not correct";
        return res.render("login", { error: error, errorType: 'IncorrectPassword' });
    }
});



// app.post('/login', async (req, res) => {
//     var password = req.body.password;
//     var email = req.body.email;

//     const schema = Joi.string().max(20).required();
//     const validationResult = schema.validate(email);
//     if (validationResult.error != null) {
//         console.log("email error :", validationResult.error);
//         res.redirect("/login");
//         return;
//     }
    
//     const result = await usersModel.find({ email: email }).select('email type firstName lastName password _id').exec();
//     console.log("result: ", result);
//     console.log("password: ", result[0].password);
//     console.log("email: ", result[0].email);
//     if (result.length == 0) {
//         var message = "User is not found";
//         res.render("loginError", { error: message });
//     }
//     if (await bcrypt.compare(password, result[0].password)) {
//         req.session.authenticated = true;
//         req.session.lastName = result[0].lastName;
//         req.session.firstName = result[0].firstName;
//         req.session.password = result[0].password;
//         req.session.email = result[0].email;
//         req.session.cookie.maxAge = expireTime;

//         res.redirect('/home');
//     }
//     else {
//         var message = "Password is not correct";
//         res.render("loginError", { error: message });
//     }
// });




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
