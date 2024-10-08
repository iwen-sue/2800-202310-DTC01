require("./utils.js");
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const mongoDBSession = require("connect-mongodb-session")(session);
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const multer = require("multer"); // npm install multer
const storage = multer.memoryStorage(); // store the file in memory as a buffer
const upload = multer({ storage: storage }); // specify the storage option
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});
const app = express();
const port = process.env.PORT || 3000;

// socket.io dependencies
const server = require("http").createServer(app);
const socketio = require("socket.io");
const io = socketio(server);

const Joi = require("joi");

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

// var { database } = include("databaseConnection");
// const { GridFSBucket } = require("mongodb");
// const db = database.db(mongodb_database); // Replace 'your_database_name' with the actual database name

//declare we use ejs res.render will use ejs the ejs files created under views
app.set("view engine", "ejs");

//false: url decode only support array or string
app.use(express.urlencoded({ extended: true }));

const store = new mongoDBSession({
  uri: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}?retryWrites=true&w=majority`,
  collection: "sessions",
  crypto: {
    secret: mongodb_session_secret,
  },
});

app.use(
  session({
    secret: node_session_secret,
    store: store, //default is memory store
    saveUninitialized: false,
    resave: true,
  })
);

// middleware function starts
/**
 * Check if the session is valid
 * @param {any} req - the request object
 * @returns {boolean} - true if the session is valid, false otherwise
 */
function isValidSession(req) {
  if (req.session.authenticated) {
    return true;
  }
  return false;
}

/**
 * Redirect page to login if the session is not valid
 * @param {any} req - the request object
 * @param {any} res - the response object
 * @param {any} next - the next function
 * @returns {any} - redirect to login page if the session is not valid
 */
function sessionValidation(req, res, next) {
  if (isValidSession(req)) {
    next();
  } else {
    res.redirect("/");
  }
}
// middleware function finishes

/**
 * Check if the id is a valid group id
 * @param {any} id - the id to be checked
 * @returns {boolean} - true if the id is valid, false otherwise
 */
function isInGroup(id) {
  const schema = Joi.string().min(22).max(25).hex();
  const result = schema.validate(id);
  if (result.error) {
    return false;
  }
  if (id == null || id == undefined) {
    return false;
  }
  return true;
}

app.use("/", (req, res, next) => {
  // for local variables
  next();
});

app.get("/", (req, res) => {
  if (req.session.authenticated) {
    res.redirect("/home");
  } else {
    res.render("index");
  }
});

// gather necessary data, render home page and send the data.
app.get("/home", sessionValidation, async (req, res) => {
  const usersModel = require("./models/user.js");
  const groupsModel = require("./models/group.js");
  const userEmail = req.session.email;
  const userName = req.session.firstName + " " + req.session.lastName;

  try {
    const query = await usersModel.findOne({ email: userEmail });
    const groupID = query.groupID;
    const groupQuery = await groupsModel.findOne({ _id: groupID });

    if (groupQuery) {
      const groupName = groupQuery.groupName;
      var country;
      if (groupQuery.country) {
        country = groupQuery.country;
      } else {
        country = "nothing here yet";
      }
      const itineraryQuery = await groupsModel.findById(groupID, "itinerary");
      const itinerary = itineraryQuery.itinerary;
      res.render("itinerary", {
        groupName: groupName + "'s Itinerary",
        itinerary: JSON.stringify(itinerary),
        country: country,
      });
    } else {
      res.render("itinerary", {
        userName: userName,
        groupName: "Join a group First!",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred." });
  }
});

// This is to pass the itinerary data to the client side.
app.get("/itineraryData", sessionValidation, async (req, res) => {
  const usersModel = require("./models/user.js");
  const groupsModel = require("./models/group.js");
  const userEmail = req.session.email;
  console.log("test");
  try {
    const query = await usersModel.findOne({ email: userEmail });
    const groupID = query.groupID;
    const groupQuery = await groupsModel.findOne({ _id: groupID });

    if (groupQuery) {
      const itineraryQuery = await groupsModel.findById(groupID, "itinerary");
      const itinerary = itineraryQuery.itinerary;
      res.json({ itinerary }); // Send the itinerary data as JSON response
    } else {
      res.status(404).json({ error: "Group not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred." });
  }
});

// gather necessary data, render chatroom page and send the data.
app.get("/chatroom", sessionValidation, async (req, res) => {
  const usersModel = require("./models/user.js");
  const groupsModel = require("./models/group.js");
  const query = usersModel.findOne({
    email: req.session.email,
  });
  query
    .then((docs) => {
      var docs = docs;
      const groupQuery = groupsModel.findOne({
        _id: docs.groupID,
      });
      groupQuery.then((groupInfo) => {
        let userObj = new Object();
        userObj.name = docs.firstName + " " + docs.lastName;
        userObj.email = docs.email;
        userObj.userID = docs._id;
        if (docs.profilePic) {
          userObj.profilePic = docs.profilePic;
        }
        res.render("chatroom", { group: groupInfo, user: userObj });
      });
    })
    .catch((err) => {
      console.error(err);
    });
});

//gather necessary data, render userprofile page and send the data.
app.get("/userprofile", sessionValidation, async (req, res) => {
  const usersModel = require("./models/user.js");
  const query = usersModel.findOne({
    email: req.session.email,
  });
  query
    .then((docs) => {
      res.render("userprofile", { user: docs });
    })
    .catch((err) => {
      console.error(err);
    });
});

// import the necessary modules
const bucketlist = require("./controller/enterBucket.js");
const toHistory = require("./controller/toHistory.js");
const editBucket = require("./controller/editBucket.js");
const deleteBucket = require("./controller/deleteBucket.js");

// catch the enter bucket list request and run defined behaviors imported from module.
app.post("/enterBucket", bucketlist);

// catch request for moving bucket list to history and run defined behaviors imported from module.
app.post("/toHistory", toHistory);

// catch request for editing the bucket list and run defined behaviors imported from module.
app.post("/editBucket", editBucket);

// catch request for deleting bucket list and run defined behaviors imported from module.
app.post("/deleteBucket", deleteBucket);

// import the necessary modules
const editProfile = require("./controller/editProfile.js");
// const { Server } = require("net");

// post request for editProfile
app.post("/editProfile", editProfile);

// render editBucket page
app.get("/editBucket", (req, res) => {
  const usersModel = require("./models/user.js");
  const query = usersModel.findOne({
    email: req.session.email,
  });
  const cardID = req.query.cardID;
  query
    .then((docs) => {
      docs.bucketlist.forEach((card) => {
        if (card._id == cardID) {
          res.render("editBucket", { card: card });
        }
      });
    })
    .catch((err) => {
      console.error(err);
    });
});

// get api key from client-side , for Grace's use
app.get("/api-key", (req, res) => {
  // Fetch the API key from your server-side storage
  const apiKey = process.env.OPENAI_API_KEY;

  // Return the API key as the response
  res.json({ apiKey });
});

//render enterBucket page
app.get("/enterBucket", (req, res) => {
  res.render("enterBucket");
});

//gather necessary data, render travel history page and send data.
app.get("/userprofile/travelHistory", (req, res) => {
  const usersModel = require("./models/user.js");
  const query = usersModel.findOne({
    email: req.session.email,
  });
  query
    .then((docs) => {
      res.render("travelHistory", { travelHistory: docs.travelHistory });
    })
    .catch((err) => {
      console.error(err);
    });
});

//gather necessary data, render signup page and send data.
app.get("/signup", (req, res) => {
  const firstName = "";
  const lastName = "";
  const email = "";
  const password = "";
  if (req.query.groupToken != null) {
    res.render("signup", {
      groupToken: req.query.groupToken,
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    });
  } else {
    res.render("signup", {
      groupToken: null,
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    });
  }
});

//gather necessary data, render login page and send data.
app.get("/login", (req, res) => {
  if (req.query.groupToken !== null) {
    res.render("login", { groupToken: req.query.groupToken, email: "" });
  } else {
    res.render("login", { groupToken: null, email: "" });
  }
});

//render forgot password page.
app.get("/forgotPassword", (req, res) => {
  res.render("forgotPassword.ejs"); // Render the forgotPassword.ejs template
});

//render reset password page
app.get("/resetPassword", async (req, res) => {
  const usersModel = require("./models/user.js");
  const user = await usersModel.findOne({ resetToken: req.query.token }).exec();
  if (!user || !req.query.token) {
    res.redirect("/home");
  } else {
    res.render("resetPassword", { email: user.email, token: req.query.token });
  }
});

//destroy session and redirect user to /
app.get("/logout", sessionValidation, (req, res) => {
  req.session.destroy(function (err) {
    res.redirect("/");
  });
});

//static images address
app.use(express.static(__dirname + "/public"));

//catch the signup request and run defined behaviors.
app.post("/signup", async (req, res) => {
  const usersModel = require("./models/user.js");
  const groupsModel = require("./models/group.js");
  try {
    // Check if all required fields are present
    if (
      !req.body.firstName ||
      !req.body.lastName ||
      !req.body.email ||
      !req.body.password
    ) {
      const firstName = req.body.firstName.replace(/\s/g, "") || "";
      const lastName = req.body.lastName.replace(/\s/g, "") || "";
      const email = req.body.email || "";
      const password = req.body.password || "";

      return res.render("signup", {
        error: "MissingFields",
        groupToken: req.body.groupToken,
        firstName,
        lastName,
        email,
        password,
      });
    }

    var userType;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new usersModel({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      // groupID: req.body.groupToken,
      // type: userType
    });
    await user.save();
    req.session.authenticated = true;
    req.session.firstName = req.body.firstName;
    req.session.lastName = req.body.lastName;
    req.session.password = hashedPassword;
    req.session.email = req.body.email;
    req.session.cookie.maxAge = 2147483647;

    if (req.body.groupToken != null) {
      userType = "member";
      var group = await groupsModel.find({ _id: req.body.groupToken }).exec();
      try {
        var currentMembers = group[0].members;
        await usersModel
          .updateOne(
            { email: req.body.email },
            { $set: { groupID: req.body.groupToken, type: userType } }
          )
          .exec();
      } catch (error) {
        res.redirect("/userprofile/groupnotfound");
        return;
      }
      var memberHasJoinedPreviously = false;
      for (var i = 0; i < currentMembers.length; i++) {
        if (currentMembers[i].email == req.body.email) {
          memberHasJoinedPreviously = true;
        }
      }
      if (memberHasJoinedPreviously) {
        for (var i = 0; i < currentMembers.length; i++) {
          if (currentMembers[i].email == req.body.email) {
            currentMembers[i].active = true;
          }
        }
        await groupsModel
          .updateOne(
            { _id: groupID },
            { $set: { members: currentMembers[0].members } }
          )
          .exec();
      } else {
        await groupsModel
          .updateOne(
            { _id: req.body.groupToken },
            {
              $push: {
                members: {
                  email: req.body.email,
                  type: "member",
                  firstName: req.body.firstName,
                  lastName: req.body.lastName,
                  active: true,
                },
              },
            }
          )
          .exec();
      }
    }
    res.redirect("/home");
  } catch (error) {
    console.error(error);
    res.render("signup", {
      error: "Try use another email that is already exists",
      groupToken: req.body.groupToken,
    });
  }
});

//catch the login request and run defined behaviors.
app.post("/login", async (req, res) => {
  const usersModel = require("./models/user.js");
  const groupsModel = require("./models/group.js");
  var password = req.body.password;
  var email = req.body.email;
  const groupToken = req.body.groupToken;

  const schema = Joi.string().max(30).required();
  const validationResult = schema.validate(email);
  if (validationResult.error != null) {
    var error = "Invalid email format. Please enter a valid email address.";
    return res.render("login", {
      error: error,
      errorType: "InvalidEmailFormat",
      groupToken: groupToken,
      email: "",
    });
  }

  const result = await usersModel
    .find({ email: email })
    .select("email type firstName lastName password profilePic groupID _id")
    .exec();

  if (result.length == 0) {
    var error = "User is not found";
    return res.render("login", {
      error: error,
      errorType: "UserNotFound",
      groupToken: groupToken,
      email: "",
    });
  }
  if (await bcrypt.compare(password, result[0].password)) {
    req.session.authenticated = true;
    req.session.lastName = result[0].lastName;
    req.session.firstName = result[0].firstName;
    req.session.password = result[0].password;
    req.session.email = result[0].email;
    req.session.cookie.maxAge = 2147483647;
    if (groupToken != null) {
      if (isInGroup(result[0].groupID)) {
        res.render("groupconfirm", {
          error:
            "You are already in a group. Please leave your current group before joining another.",
          groupName: null,
        });
        return;
      } else {
        var group = await groupsModel.find({ _id: req.body.groupToken }).exec();
        try {
          var currentMembers = group[0].members;
        } catch (error) {
          console.log(error);
          res.redirect("/userprofile/groupnotfound");
          return;
        }
        var memberHasJoinedPreviously = false;
        for (var i = 0; i < currentMembers.length; i++) {
          if (currentMembers[i].email == req.body.email) {
            memberHasJoinedPreviously = true;
          }
        }
        if (memberHasJoinedPreviously) {
          for (var i = 0; i < currentMembers.length; i++) {
            if (currentMembers[i].email == email) {
              currentMembers[i].active = true;
            }
          }
          await groupsModel
            .updateOne(
              { _id: groupToken },
              { $set: { members: currentMembers } }
            )
            .exec();
        } else {
          await groupsModel
            .updateOne(
              { _id: groupToken },
              {
                $push: {
                  members: {
                    email: result[0].email,
                    type: "member",
                    firstName: result[0].firstName,
                    lastName: result[0].lastName,
                    profilePic: result[0].profilePic,
                    active: true,
                  },
                },
              }
            )
            .exec();
        }
        await usersModel
          .updateOne(
            { email: result[0].email },
            { $set: { groupID: groupToken, type: "member" } }
          )
          .exec();
      }
    }
    res.redirect("/home");
  } else {
    var error = "Password is not correct";
    return res.render("login", {
      error: error,
      errorType: "IncorrectPassword",
      groupToken: groupToken,
      email: email,
    });
  }
});

//catch forgot password request and run the defined behaviors.
app.post("/forgotPassword", async (req, res) => {
  const usersModel = require("./models/user.js");
  try {
    const email = req.body.email;
    const user = await usersModel.findOne({ email: email }).exec();
    if (!user) {
      return res.render("forgotPassword", { error: "UserNotFound", email: "" });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // Expiration in 1 hour
    const expiryDate = new Date(resetTokenExpiry);
    user.resetToken = resetToken;
    user.resetTokenExpiration = expiryDate;

    await user
      .save()
      .then(async () => {
        res.render("forgotPassword", {
          success: "Email is successfully sent.",
          email: email,
        });
      })
      .catch((err) => {
        console.log(err);
      });

    setTimeout(async () => {
      await usersModel.updateOne(
        { email: email },
        { $unset: { resetTokenExpiration: 1 } }
      );
    }, 3600000);

    const transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: "vacapal@outlook.com",
        pass: "comp2800!",
      },
    });
    const resetUrl = `http://${process.env.APP_DOMAIN}/resetPassword?token=${resetToken}`;
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL,
      subject: "Reset your password on Vacapal",
      html: `
                <img src="https://raw.githubusercontent.com/nicky81818/images/069cfd55e0f576147dbdb1e1dd98711b29f05677/vacapal-purple.svg" title="Vacapal logo" alt="Vacapal logo" height="100px" width="400px" style="display: block">
                <p>Hi ${user.firstName} ${user.lastName},</p>
                <p>Please click on the following link, or paste this into your browser to reset your password: <a href="${resetUrl}">here</a></p>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
                <h3>Thank you for using VacaPal!</h3>
                <h4>Best regards,</h4>
                <h4>The VacaPal Team</h4>
                <p>For our privacy policy, <a href="https://www.privacypolicies.com/live/b3c518bb-bebe-497e-9b34-4b78bcac834c">click here.</a> Provided by Privacy Policies Generator.</p>
                <footer>VacaPal &copy</footer>
                `,
    };
    await transporter.sendMail(mailOptions);
    res.render("forgotPassword", { success: "EmailSent", email: email });
  } catch (error) {
    console.error(error);
    res.render("forgotPassword", { error: "Error", email: email });
  }
});

//catch reset password request and run the defined behaviors.
app.post("/resetPassword", async (req, res) => {
  const usersModel = require("./models/user.js");
  try {
    const token = req.body.token;
    const email = req.body.email;
    const newPassword = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (newPassword !== confirmPassword) {
      return res.render("resetPassword", {
        error: "PasswordNotMatch",
        token: token,
        email: email,
      });
    } else {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await usersModel
        .findOneAndUpdate({ resetToken: token }, { password: hashedPassword })
        .exec();
      return res.render("login", {
        success: "Password is succesfully reset. Please try log in again",
      });
    }
  } catch (error) {
    console.error(error);
    return res.render("resetPassword", {
      error: "Error",
      token: req.body.token,
      email: req.body.email,
    });
  }
});

//static images address
app.use(express.static(__dirname + "/public"));

//render creategroup page
app.get("/creategroup", sessionValidation, (req, res) => {
  res.render("creategroup", { error: null });
});

//catch group confirmation request and run defined behaviors.
app.post("/groupconfirm", sessionValidation, async (req, res) => {
  const usersModel = require("./models/user.js");
  const groupsModel = require("./models/group.js");
  var groupName = req.body.groupName;
  const schema = Joi.string().trim().max(20).required();
  const validationResult = schema.validate(groupName);
  if (validationResult.error != null) {
    return res.render("creategroup", {
      error: validationResult.error.toString(),
    });
  }
  const currentUser = await usersModel
    .findOne({ email: req.session.email })
    .exec();
  try {
    const newGroup = new groupsModel({
      groupName: groupName,
      members: [
        {
          email: currentUser.email,
          type: "leader",
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          profilePic: currentUser.profilePic,
          active: true,
        },
      ],
    });
    await newGroup.save();
    const group = await groupsModel.findOne({ groupName: groupName }).exec();
    await usersModel
      .updateOne(
        { email: req.session.email },
        { $set: { groupID: group._id, type: "leader" } }
      )
      .exec();
    res.render("groupconfirm", { groupName: req.body.groupName, error: null });
  } catch (err) {
    res.render("creategroup", {
      error: "Group name is already taken. Please enter another group name.",
    });
  }
});

//gather necessary information and render groupdetails page, if try block fail redirect it user profile
app.get("/userprofile/groupdetails", sessionValidation, async (req, res) => {
  const usersModel = require("./models/user.js");
  const groupsModel = require("./models/group.js");
  var currentUser = await usersModel
    .findOne({ email: req.session.email })
    .exec();
  const group = await groupsModel.findOne({ _id: currentUser.groupID }).exec();
  try {
    var allMembers = group.members;
    res.render("groupdetails", {
      user: currentUser,
      group: allMembers,
      groupName: group.groupName,
      groupID: group._id,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/userprofile");
  }
});

//catch invite request, gather necessary information, send invite email, and render emailconfirmation page
app.post("/invite", sessionValidation, async (req, res) => {
  var inviteEmail = req.body.inviteeEmail;
  const userName = req.session.firstName + " " + req.session.lastName;
  const groupToken = req.body.groupID;
  const inviteMessage = {
    from: process.env.EMAIL,
    to: inviteEmail,
    subject: "You have been invited to join a group on VacaPal!",
    html: `
            <img src="https://raw.githubusercontent.com/nicky81818/images/069cfd55e0f576147dbdb1e1dd98711b29f05677/vacapal-purple.svg" title="Vacapal logo" alt="Vacapal logo" height="100px" width="400px" style="display: block">
            <h1>You have been invited by ${userName} to join their group on VacaPal!</h1>
            <p>Click <a href="http://${process.env.APP_DOMAIN}/signup?groupToken=${groupToken}">here</a> to sign up and join the group!</p>
            <p>If you already have an account, click <a href="http://${process.env.APP_DOMAIN}/login?groupToken=${groupToken}">here</a> to log in and join the group!</p>
            <p>Or, enter this token in your profile after clicking "Join Group": <b>${groupToken}</b></p>
            <p>If you do not recognize the inviter, please ignore this email.</p>
            <h3>Thank you for using VacaPal!</h3>
            <h4>Best regards,</h4>
            <h4>The VacaPal Team</h4>
            <p>For our privacy policy, <a href="https://www.privacypolicies.com/live/b3c518bb-bebe-497e-9b34-4b78bcac834c">click here.</a> Provided by Privacy Policies Generator.</p>
            <footer>VacaPal &copy</footer>
            `,
  };

  transporter.sendMail(inviteMessage, (err, info) => {
    if (err) {
      res.render("emailconfirmation", { error: err });
      console.log(err);
    } else {
      res.render("emailconfirmation", { error: null });
      console.log(info.response);
    }
  });
});

//catch removemember request, run defined behaviors and redirect to groupdetails page
app.post("/removemember", sessionValidation, async (req, res) => {
  const usersModel = require("./models/user.js");
  const groupsModel = require("./models/group.js");
  var memberEmail = req.body.memberEmail;
  var groupID = req.body.groupID;
  var currentMembers = await groupsModel.find({ _id: groupID }).exec();
  for (var i = 0; i < currentMembers[0].members.length; i++) {
    if (currentMembers[0].members[i].email == memberEmail) {
      currentMembers[0].members[i].active = false;
    }
  }
  await groupsModel
    .updateOne(
      { _id: groupID },
      { $set: { members: currentMembers[0].members } }
    )
    .exec();
  await usersModel
    .updateOne({ email: memberEmail }, { $set: { groupID: null, type: null } })
    .exec();
  res.redirect("/userprofile/groupdetails");
});

// catch joingroup request, run defined behaviors and redirect to groupdetails page
app.post("/joingroup", sessionValidation, async (req, res) => {
  var groupToken = req.body.groupToken;
  var currentUser = await usersModel
    .findOne({ email: req.session.email })
    .exec();
  try {
    var group = await groupsModel.find({ _id: req.body.groupToken }).exec();
    var currentMembers = group[0].members;
    var memberHasJoinedPreviously = false;
    for (var i = 0; i < currentMembers.length; i++) {
      if (currentMembers[i].email == req.session.email) {
        memberHasJoinedPreviously = true;
      }
    }
    if (memberHasJoinedPreviously) {
      for (var i = 0; i < currentMembers.length; i++) {
        if (currentMembers[i].email == req.session.email) {
          currentMembers[i].active = true;
        }
      }
      await groupsModel
        .updateOne({ _id: groupToken }, { $set: { members: currentMembers } })
        .exec();
    } else {
      await groupsModel
        .updateOne(
          { _id: groupToken },
          {
            $push: {
              members: {
                email: currentUser.email,
                type: "member",
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                profilePic: currentUser.profilePic,
                active: true,
              },
            },
          }
        )
        .exec();
    }

    await usersModel
      .updateOne(
        { email: req.session.email },
        { $set: { groupID: groupToken, type: "member" } }
      )
      .exec();
    res.redirect("/userprofile/groupdetails");
  } catch (err) {
    res.redirect("/userprofile/groupnotfound");
  }
});

//render groupnotfound page
app.get("/userprofile/groupnotfound", sessionValidation, async (req, res) => {
  res.render("groupnotfound");
});

//catch leavegroup request, run the defined behaviors and redirect to userprofile
app.post("/leavegroup", sessionValidation, async (req, res) => {
  const usersModel = require("./models/user.js");
  const groupsModel = require("./models/group.js");
  var groupID = req.body.groupID;
  var currentMembers = await groupsModel.find({ _id: groupID }).exec();
  for (var i = 0; i < currentMembers[0].members.length; i++) {
    if (currentMembers[0].members[i].email == req.session.email) {
      currentMembers[0].members[i].active = false;
    }
  }
  await groupsModel
    .updateOne(
      { _id: groupID },
      { $set: { members: currentMembers[0].members } }
    )
    .exec();
  await usersModel
    .updateOne(
      { email: req.session.email },
      { $set: { groupID: null, type: null } }
    )
    .exec();
  res.redirect("/userprofile");
});

//catch deletegroup, run the defined behaviors and redirect to userprofile page.
app.post("/deletegroup", sessionValidation, async (req, res) => {
  const groupsModel = require("./models/group.js");
  const usersModel = require("./models/user.js");
  var groupID = req.body.groupID;
  await groupsModel.deleteOne({ _id: groupID }).exec();
  await usersModel
    .updateMany({ groupID: groupID }, { $set: { groupID: null, type: null } })
    .exec();
  res.redirect("/userprofile");
});

//get and send the request sentiment data to frontend
app.get("/chatroom/sentimentScores", sessionValidation, async (req, res) => {
  const groupsModel = require("./models/group.js");
  var groupID = req.query.id;
  groupsModel.findOne({ _id: groupID }).then((docs) => {
    res.status(200).json({ data: docs.memberSentiment });
  });
});

//catch uploadImage request, and send the image buffer data back to frontend
app.post(
  "/uploadImage",
  sessionValidation,
  upload.single("imageData"),
  async (req, res) => {
    const imageData = req.file;
    if (imageData) {
      res.status(200).json({
        message: "Image uploaded successfully",
        imageData: imageData.buffer,
      });
    } else {
      res.status(404).json({ message: "File not found" });
    }
  }
);

const categories = [
  "Sightseeing",
  "Outdoor Adventure",
  "Cultural Experience",
  "Food and Dining",
  "Shopping",
  "Entertainment",
  "Nature Exploration",
  "Relaxation",
];

//catch the submitNew request, run the defined behaviors and send the necessary data to frontend
app.post("/itinerary/submitNew", sessionValidation, async (req, res) => {
  console.log("submission received");
  const usersModel = require("./models/user.js");
  const groupsModel = require("./models/group.js");
  var citiesArray = JSON.parse(req.body.cities);
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const country = req.body.country;
  const cities = citiesArray;
  const userEmail = req.session.email;
  const query = await usersModel.findOne({ email: userEmail });
  const groupID = query.groupID;
  const diffDays =
    new Date(endDate) - new Date(startDate) / (1000 * 60 * 60 * 24);
  console.log(startDate, endDate);
  const itineraryMemory = [
    {
      date: "YYYY-MM-DD",
      schedule: [
        {
          startTime: startTime,
          endTime: "endTime you estimate",
          category: "category you choose",
          activity: "recommend ",
          transportation: "transportation with estimated time",
        },
        {
          startTime: "get this start time from the previous endTime",
          endTime: "endTime you estimate",
          category: "category you choose",
          activity: "recommend ",
          transportation: "transportation with estimated time",
        },
      ],
    },
  ];
  const conversation = [
    {
      role: "system",
      content: `You are an Assistant that provides recommendations for trip itineraries in a format of ${JSON.stringify(
        itineraryMemory
      )} in an array.`,
    },
    { role: "user", content: `I need help planning a trip to ${cities}.` },
    {
      role: "assistant",
      content:
        "When are you planning to visit there, and how long the travel will be?",
    },
    {
      role: "user",
      content: `My travel starts from the day of ${startDate} and finish on ${endDate}. The length of my trip duration which is also the length of the array data you will generate is ${diffDays}. I will start from ${startTime} to ${endTime} per day. I want finish all activities at ${endTime}.`,
    },
    {
      role: "assistant",
      content: "What are your preferred categories of activities?",
    },
    { role: "user", content: `I\'m interested in ${categories}.` },
    {
      role: "assistant",
      content:
        "Let me generate an itinerary for you based on your preferences.",
    },
    {
      role: "user",
      content: `Don\'t forget to include schedule and transportation time in schedule, and date. Make sure your output is pure JSON format iteranaries without anything else so we can use JSON.parse to your output.`,
    },
    {
      role: "assistant",
      content:
        "sure, I will output a JSON format itineraries array for you now the start token will be [ end token will be ]",
    },
  ];
  let itinerary; // Declare itinerary variable outside the promise chain
  try {
    itinerary = await generateItinerary(conversation);
    console.log(itinerary);
    const startIndex = itinerary.indexOf("[");
    const endIndex = itinerary.lastIndexOf("]") + 1;
    const itineraryContent = itinerary.substring(startIndex, endIndex).trim();
    const parsedItinerary = JSON.parse(itineraryContent);
    await saveItinerary(parsedItinerary, groupID, country);
    res.json({
      itinerary: parsedItinerary,
      message: "Itinerary generated successfully!",
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred", message: "An error occurred" });
  }

  /**
   * save the given itinerary in databse.
   *
   * @param {Object} itineraryJSON - JSON object with itinerary data information
   * @param {String} groupID - unique group ID
   * @param {String} country - destination country name
   */
  async function saveItinerary(itineraryJSON, groupID, country) {
    // Delete the existing itinerary array
    await groupsModel
      .updateOne({ _id: groupID }, { $unset: { itinerary: 1 } })
      .exec();

    // Create a new itinerary array and push the new itinerary into it
    if (country) {
      const update = {
        $push: { itinerary: { $each: itineraryJSON } },
        $set: { country: country },
      };
      await groupsModel.updateOne({ _id: groupID }, update).exec();
    } else {
      const update = { $push: { itinerary: { $each: itineraryJSON } } };
      await groupsModel.updateOne({ _id: groupID }, update).exec();
    }
  }
});

/**
 * generate Itinerary information through openAI.
 *
 * @param {Object} conversation - JSON object contains conversation information
 * @returns {*} - AI respond
 */
async function generateItinerary(conversation) {
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "user", content: JSON.stringify(conversation) },
      {
        role: "system",
        content:
          "You are an Assistant that applies JSON format to an itinerary",
      },
    ],
    temperature: 0.2, // Adjust the temperature value for faster response time
  });
  let response = res.choices[0].message.content;
  return response;
}

/**
 * generate a new itinerary through openAI.
 *
 * @param {String} prompt - the prompt passes to AI
 * @returns {*} - respond from AI
 */
async function newItinerary(prompt) {
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "user", content: prompt },
      {
        role: "system",
        content:
          "You are an Assistant that applies JSON format to an itinerary",
      },
    ],
    temperature: 0.2, // Adjust the temperature value for faster response time
  });

  let response = res.choices[0].message.content;

  return response;
}

//catch date adjustment request and pass the result respond to frontend.
app.post("/itinerary/adjustment", sessionValidation, async (req, res) => {
  const usersModel = require("./models/user.js");
  const groupsModel = require("./models/group.js");
  const userEmail = req.session.email;
  const userQuery = await usersModel.findOne({ email: userEmail });
  const groupID = userQuery.groupID;
  const groupQuery = await groupsModel.findOne({ _id: groupID });
  const preItinerary = groupQuery.itinerary;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const promptArgs = `Make an itinerary from ${startDate} to ${endDate}, the same country, cities, startTime, and endTime as ${preItinerary} in a format {date :, schedule: [{"startTime":,"endTime":, "category":, "activity":, "transportation":  transportation with estimated time }]}, Make an object for each date in JSON format that is in an array. Assign dates properly in only one city considering distance. Include recommended transportation for each activity. Use the following categories to categorize each activity: ${categories}`;

  let itinerary; // Declare itinerary variable outside the promise chain
  try {
    itinerary = await newItinerary(promptArgs);
    const startIndex = itinerary.indexOf("[");
    const endIndex = itinerary.lastIndexOf("]") + 1;
    const itineraryContent = itinerary.substring(startIndex, endIndex);
    const parsedItinerary = JSON.parse(itineraryContent);
    await saveItinerary(parsedItinerary, groupID, null);
    res.status(200).json({
      message: "Travel Dates adjusted successfully",
      itinerary: parsedItinerary,
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred", message: "An error occurred" });
  }
});

//catch the edit request, run the defined behaviors and send the success message to frontend.
app.post("/itinerary/edit", sessionValidation, async (req, res) => {
  const usersModel = require("./models/user.js");
  const groupsModel = require("./models/group.js");
  const date = req.body.date;
  const referStartTime = req.body.referStartTime;
  const editedSchedule = JSON.parse(req.body.schedule);
  const editedStartTime = editedSchedule.startTime;
  const editedEndTime = editedSchedule.endTime;
  const editedActivity = editedSchedule.activity;
  const userEmail = req.session.email;
  const userQuery = await usersModel.findOne({ email: userEmail });
  const groupID = userQuery.groupID;

  const filter = { _id: groupID };
  const update = {
    $set: {
      "itinerary.$[itineraryObj].schedule.$[scheduleObj].startTime":
        editedStartTime,
      "itinerary.$[itineraryObj].schedule.$[scheduleObj].endTime":
        editedEndTime,
      "itinerary.$[itineraryObj].schedule.$[scheduleObj].activity":
        editedActivity,
    },
  };
  const options = {
    arrayFilters: [
      { "itineraryObj.date": date },
      { "scheduleObj.startTime": referStartTime },
    ],
    new: true,
  };
  const updatedDocument = await groupsModel.findOneAndUpdate(
    filter,
    update,
    options
  );
  res.status(200).json({ message: "edit updated successful!" });
});

// catch the delete request, run the defined behaviors and pass the success message to frontend.
app.post("/itinerary/delete", sessionValidation, async (req, res) => {
  const usersModel = require("./models/user.js");
  const groupsModel = require("./models/group.js");
  const date = req.body.date;
  const scheduleElem = JSON.parse(req.body.deleteSchedule);
  const startTime = scheduleElem.startTime;
  const userEmail = req.session.email;
  const userQuery = await usersModel.findOne({ email: userEmail });
  const groupID = userQuery.groupID;

  const filter = {
    _id: groupID,
    "itinerary.date": date,
    "itinerary.schedule.startTime": startTime,
  };

  const update = {
    $pull: { "itinerary.$.schedule": { startTime: startTime } },
  };

  const result = await groupsModel.updateOne(filter, update);

  if (result.modifiedCount === 0) {
    res
      .status(404)
      .json({ error: "Matching object not found in the itinerary" });
    return;
  }
  res.status(200).json({ message: "Activity deleted successfully" });
});

//static images address
app.use(express.static(__dirname + "/public"));
// handle 404 - page not found
// must put this in the very last otherwise it will catch all routes as 404
app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});

// socketio part starts
let memory = []; // store user input for AI's memory
let lastActivityTimeSTP = null; // last activity time stamp
io.on("connection", (socket) => {
  const groupsModel = require("./models/group.js");
  socket.on("joinedRoom", (joinedRoomObj) => {
    console.log(joinedRoomObj.name, " joined room ");
    socket.join(joinedRoomObj.groupID);
    let message = joinedRoomObj.name + " has joined the chat";

    //broadcast when a user connect, to everyone except the client connecting
    //notify who enters the chatroom and who leaves the chatroom
    socket.broadcast.to(joinedRoomObj.groupID).emit("message", message);
  });

  socket.on("chatHistory", async (groupID) => {
    //save message to database
    messageHistory = await showChatHistory(groupID);
    //emit to the single user
    socket.emit("chatHistory", messageHistory);
  });

  //listen for chat message
  socket.on("chatMessage", async (chatMessageObj) => {
    var group = await groupsModel.findOne({ _id: chatMessageObj.groupID });
    const maxMessageHistory = 10;

    // set inactive threshold
    lastActivityTimeSTP = Date.now();
    const inactiveThreshold = 1000 * 60 * 5; // 5 minutes
    setInterval(async () => {
      if (
        lastActivityTimeSTP &&
        Date.now() - lastActivityTimeSTP > inactiveThreshold
      ) {
        // user is inactive
        // console.log("user is inactive");
        if (memory.length > maxMessageHistory) {
          memory = memory.slice(-maxMessageHistory);
        }
        await groupsModel.updateOne(
          { _id: chatMessageObj.groupID },
          { $set: { chatContext: memory } }
        );
      }
    }, 10000); //Check every 10 seconds

    if (typeof chatMessageObj.message == "string") {
      //save message to database
      saveMessage(chatMessageObj);
      io.to(chatMessageObj.groupID).emit("chatMessage", { chatMessageObj });

      let userMessage = `${chatMessageObj.userName}: ${chatMessageObj.message}`;
      console.log(userMessage);

      // check if there is chat log in the database
      if (group.chatContext.length > 0 && memory.length == 0) {
        console.log("chat log in the database");
        memory.push(...group.chatContext); //need to be an array
      }

      const promptArgs =
        `Sentiment analyze this dialogue based on the dialogue you heard and provide me with only a JSON data in a format of {userName:${chatMessageObj.userName}, score:sentimentScore, email:${chatMessageObj.email} ,suggestion: give suggestion of how I can help out as a friend if the score is lower than 0.1, context: describe the context for the score, emoji: emoji in numeric character reference that fits the reason}}, nothing should be generated except for the JSON format data: \n\n` +
        userMessage +
        "\n\n";

      memory.push(userMessage);
      console.log(memory);

      // AI analysis
      const res = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "assistant", content: memory.join("") },
          { role: "user", content: promptArgs }, // user input TODO
        ],
        temperature: 0.3,
      });
      let response = res.choices[0].message.content;

      // console.log(response);  // AI response
      try {
        jsonObj = JSON.parse(response);
        console.log(jsonObj); // AI response in JSON format

        //find the group
        var group = await groupsModel.findOne({ _id: chatMessageObj.groupID });
        var result = group.memberSentiment.find(
          (member) => member.email == jsonObj.email
        );
        if (result) {
          await groupsModel.updateOne(
            {
              _id: chatMessageObj.groupID,
              "memberSentiment.email": jsonObj.email,
            },
            {
              $set: {
                "memberSentiment.$.score": jsonObj.score,
                "memberSentiment.$.suggestion": jsonObj.suggestion,
                "memberSentiment.$.context": jsonObj.context,
                "memberSentiment.$.emoji": jsonObj.emoji,
              },
            }
          );
        } else {
          group.memberSentiment.push(jsonObj);
          await group.save();
        }
        const getSentiment = await groupsModel.findOne({
          _id: chatMessageObj.groupID,
          "memberSentiment.email": jsonObj.email,
        });
        const memberResult = getSentiment.memberSentiment.find(
          (member) => member.email == jsonObj.email
        );
        console.log(memberResult);
        socket.broadcast
          .to(chatMessageObj.groupID)
          .emit("sentimentScore", { memberSentiment: memberResult });
      } catch (error) {
        console.log(error);
        // ignore error
      }
    } else {
      //user sent image data
      //do not save the image data into messages history
      // saveMessage(chatMessageObj);
      io.to(chatMessageObj.groupID).emit("chatMessage", { chatMessageObj });
    }
  });

  socket.on("moreChatHistory", async (groupID, numOfScroll) => {
    const getMoreMessageHistory = await showMoreChatHistory(
      groupID,
      numOfScroll
    );
    if (getMoreMessageHistory.length == 0) {
      socket.emit("noMoreChatHistory", (data = true));
    }
    if (numOfScroll > 0) {
      socket.emit("moreChatHistory", getMoreMessageHistory);
    }
  });

  socket.on("deleteMessage", async (groupID, timeStp, chatMessageText) => {
    await deleteMessageDB(groupID, timeStp, chatMessageText);
    socket.emit("deleteMessage", { groupID, timeStp, chatMessageText });
  });
  /**
   * delete the chat message in the database.
   *
   * @param {String} groupID -unique group ID
   * @param {String} messagerName - messager Name
   * @param {String} chatMessageText - message text
   */
  async function deleteMessageDB(groupID, messagerName, chatMessageText) {
    try {
      const updateResult = await groupsModel
        .updateOne(
          { _id: groupID },
          {
            $pull: {
              messages: { message: chatMessageText, userName: messagerName },
            },
          }
        )
        .exec();
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * save chat message in database.
   *
   * @param {Object} chatMessageObj - message information details
   * @returns {Array} - updated messages records
   */
  async function saveMessage(chatMessageObj) {
    try {
      const group = await groupsModel.findOne({ _id: chatMessageObj.groupID });

      if (group) {
        const update = { $push: { messages: chatMessageObj } };
        await groupsModel.updateOne({ _id: chatMessageObj.groupID }, update);
        return group.messages;
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * load more chat history depends on front end scroll behaviors.
   *
   * @param {String} groupID - unique group ID
   * @param {Number} numOfScroll - number of scroll recorded
   * @returns
   */
  async function showMoreChatHistory(groupID, numOfScroll) {
    try {
      const group = await groupsModel.findOne({ _id: groupID });
      numOfScroll -= 1;
      const numOfMessages = group.messages.length;
      var modifyMessages = [];
      if (group) {
        if (numOfMessages == 15) {
          modifyMessages = [];
          console.log("when 15 msgs", modifyMessages);
        } else {
          modifyMessages = group.messages
            .reverse()
            .slice(15 + 4 * numOfScroll, 15 + 4 * numOfScroll + 4);
          console.log("more than 15 msgs", modifyMessages);
        }
        return modifyMessages;
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * trigger the default message history load.
   *
   * @param {String} groupID - unique group ID
   * @returns {Array} - messages array after modification
   */
  async function showChatHistory(groupID) {
    try {
      const group = await groupsModel.findOne({ _id: groupID });
      if (group) {
        console.log(Array.isArray(group.messages));
        const modifyMessages = group.messages.slice(-15);

        return modifyMessages;
      }
    } catch (error) {
      console.log(error);
    }
  }
}); // socketio part ends

server.listen(port, () => {
  console.log("Node application listening on port " + port);
});
