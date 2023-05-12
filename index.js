require("./utils.js");
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoDBSession = require('connect-mongodb-session')(session);
// const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const usersModel = require('./models/user.js');
const ejs = require('ejs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT || 3000;

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

const userCollection = database.db(mongodb_database).collection('users');


//declare we use ejs res.render will use ejs the ejs files created under views
app.set('view engine', 'ejs');

//false: url decode only support array or string
app.use(express.urlencoded({ extended: false }))

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

app.get('/userprofile', (req, res) => {
    res.render("userprofile");
});

app.get('/signup', (req, res) => {
    res.render("signup");
});

app.get('/login', (req, res) => {
    res.render("login");
});

app.get('/forgotPassword', (req, res) => {
    res.render('forgotPassword.ejs'); // Render the forgotPassword.ejs template
});


app.get('/resetPassword', async (req, res) => {
    console.log(req.query.token);
    const user = await usersModel.findOne({ resetToken: req.query.token }).exec();
    console.log(user)
    console.log(req.query.token===null)
    if (!user || !req.query.token) {
        res.redirect('/home');
    } else {
        res.render('resetPassword', { email: user.email, token: req.query.token });
    }

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
        req.session.cookie.maxAge = 2147483647;

        res.redirect('/home');
    }
    else {
        var error = "Password is not correct";
        return res.render("login", { error: error, errorType: 'IncorrectPassword' });
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
        const resetUrl = `http://localhost:3000/resetPassword?token=${resetToken}`;
        const mailOptions = {
            to: user.email,
            from: 'vacapal@outlook.com',
            subject: 'Reset your password on Vacapal',
            text: `Hi ${user.firstName} ${user.lastName} \n
            Please click on the following link, or paste this into your browser to complete the process:\n
            ${resetUrl}\n
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

// handle 404 - page not found
// must put this in the very last otherwise it will catch all routes as 404
app.get("*", (req, res) => {
    res.status(404);
    res.render("404");
})


app.listen(port, () => {
    console.log("Node application listening on port " + port);
});
