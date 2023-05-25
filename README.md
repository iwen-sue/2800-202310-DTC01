# 2800-202310-DTC01

## VacaPal

### Project Description
Our project, VacaPal, is developing a travel planning and coordination app to help friends create travel itineraries and make informed decisions, with the help of sentiment analysis in chat rooms.

### Scope of functionalities
* a sentiment analysis chatroom powered by OpenAI
* itinerary planning powered by OpenAI
* user profile
* bucketlist powered by OpenAI
* login, log out, sign up
* easter egg supprise 

### Technologies used
#### Frontend:
HTML(Hypertext Markup Language): Used for structuring the content of web pages.
CSS(Cascading Style Sheet): Used for styling and formatting the visual appearance of web pages.
Bootstrap 4: A CSS framework used for responsive, mobile-first front-end web development.
Javascript: A programming language that enables interactivity and dynamic behavior on web pages.
jQuery 3.2.1: JavaScript library that makes HTML DOM interactions easier.
SweetAlert 3.0: A library designed for pretty alert messages.

#### Backend:
JavaScript(express.js) under Node.js environment

#### NPM pacakages:
    "bcrypt": "^5.1.0",
    "body-parser": "^1.20.2",
    "browserify": "^17.0.0",
    "connect-mongodb-session": "^3.1.1",
    "crypto": "^1.0.1",
    "crypto-js": "^4.1.1",
    "crypto-random-string": "^5.0.0",
    "csv-parse": "^5.3.10",
    "dotenv": "^16.0.3",
    "ejs": "^3.1.9",
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "joi": "^17.8.4",
    "moment": "^2.29.4",
    "mongodb": "^5.4.0",
    "mongoose": "^7.1.1",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.2",
    "openai": "^3.2.1",
    "readline": "^1.3.0",
    "socket.io": "^4.6.1"
#### Database:
NoSQL database: MongoDB
#### Other Software:
Version control systems: Git
Package managers: npm
Integrated Development Environments(IDEs): Visual Studio Code
Deployment and hosting platforms: Heroku, GitHub
### Contents of Project Folder 
│   .env
│   .gitignore
│   databaseConnection.js
│   index.js
│   package-lock.json
│   package.json
│   Procfile
│   README.md
│   utils.js
│
├───controller
│       deleteBucket.js
│       editBucket.js
│       editProfile.js
│       enterBucket.js
│       toHistory.js
│
├───models
│       group.js
│       user.js
│
├───public
│   ├───assets
│   │       bucketlist.css
│   │       chatroom.css
│   │       common.css
│   │       easteregg.css
│   │       easteregg.mp3
│   │       enterBucketList.css
│   │       groupdetails.css
│   │       itinerary.css
│   │       login.css
│   │       nav.css
│   │       Travel details dataset.csv
│   │       travelHistory.css
│   │       userProfile.css
│   │
│   ├───image
│   │       001.jpg
│   │       logo-fontless.svg
│   │       logo.svg
│   │       vacapal.svg
│   │
│   ├───scripts
│   │       chatroom.js
│   │       common.js
│   │       easteregg.js
│   │       enterBucketList.js
│   │       groupdetails.js
│   │       itinerary.js
│   │       resetPassword.js
│   │       travelrecs.js
│   │       userprofile.js
│   │       validatetoken.js
│   │
│   └───userProfileImages
│           avatar-default.png
│
└───views
    │   404.ejs
    │   chatroom.ejs
    │   creategroup.ejs
    │   editBucket.ejs
    │   emailconfirmation.ejs
    │   enterBucket.ejs
    │   errorMessage.ejs
    │   forgotPassword.ejs
    │   groupconfirm.ejs
    │   groupdetails.ejs
    │   groupnotfound.ejs
    │   home.ejs
    │   index.ejs
    │   itinerary.ejs
    │   login.ejs
    │   resetPassword.ejs
    │   signup.ejs
    │   travelHistory.ejs
    │   userprofile.ejs
    │
    └───templates
            bottomNav.ejs
            bucketlist.ejs
            header.ejs
            joinGroup.ejs
            makeItinerary.ejs
            nav.ejs
            subNav.ejs
### How to install or run the project
Language(s): Javascript, EJS, and CSS
IDEs: Visual Studio Code
Database(s): MongoDB
Other software: Git, Node.js, npm
The project is hosted at https://vacapal.herokuapp.com/ if the link is not available anymore you can follow the steps to install it from github:
1. Clone or download the project
2. Install dependencies using npm install
3. Set up configuration in .env file You will need:
    1)MONGODB_HOST
    2)MONGODB_USER
    3)MONGODB_PASSWORD
    4)MONGODB_DATABASE
    5)MONGODB_SESSION_SECRET
    6)NODE_SESSION_SECRET
    7)EMAIL (to send invitation emails)
    8)EMAIL_PASSWORD (to send invitation emails)
    9)APP_DOMAIN
    10)OPENAI_API_KEY
4. Start the server by node index.js or nodemon index.js
5. Access the application by the default URL http://localhost:3000
6. Please ensure that you have a valid internet connection to run the project

### Credits, References, and Licenses
#### Credits
1. Bootstrap
2. jQuery
3. Node.js
4. Github
5. Git
6. Google Material Icon
7. countriesnow.space
8. Kaggle.com
9. Travel details dataset provided by KIATTISAK RATTANAPORN on Kaggle.com
10. OpenAI
11. Heroku
12. picsum.photos
13. Adobe Suite
14. Source Tree
15. Vscode
16. MongoDB
17. Mongoose
18. Trello
19. Notion
20. Figma
21. BCIT
22. Christopher Thompson- for his guidance and support

            
#### Collaborator List
1. Muyang Li
2. Grace Su
3. Julie
4. Nicole Hsu

#### References
* 404.gif in 404 ejs file is found at https://c-ssl.dtstatic.com/uploads/item/202002/26/20200226041958_mkuyr.thumb.1000_0.gif
* user default avatar image originally references to https://en.wikipedia.org/wiki/File:Default_pfp.svg
* JS code in easteregg.js references to https://codepen.io/Wujek_Greg/pen/EpJwaj
* easteregg animation Designed by Gustavo Viselner https://dribbble.com/shots/3979515-It-s-not-unusual and Thanks for Una Kravets for Sass Pixel Art technique
https://una.im/sass-pixel-art/
* Music: It's Not Unsual by Tom Jones &copy;
* privacy policy provided by PrivacyPolicies
* Travel details dataset provided by KIATTISAK RATTANAPORN at https://www.kaggle.com/datasets/rkiattisak/traveler-trip-data 

## AI Usage
### AI Products Used
* OpenAI GPT3.5 Turbo Model
* OpenAI ChatGPT 
* GitHub Copilot
### Description
* Did you use AI to help create your app? If so, how? Be specific.

We incorporated AI in all aspects of this project, from formulating our ideas, to creating functions for our app. In the brainstorming stage, we used ChatGPT to help come up with potential features as well as a name for our app. With implementation, we used ChatGPT to help debug our code, and GitHub Copilot to help us write our functions.
* Did you use AI to create data sets or clean data sets? If so, how? Be specific.

We used AI to aid us in analyzing datasets that we found, by formulating prompts to get the analyses that we wanted to incorporate into our app. Integrating the AI analysis helped us form the recommendations for trips for users.
* Does your app use AI? If so, how? Be specific.

Our app uses the OpenAI API for their GPT-3.5 Turbo model to generate itinerary plans based on inputs from the user, for example what cities and countries they would like to travel to, start and end dates, and start and end times. We use this model to generate sentiment analyses on our chatroom, giving users specifc feedback on how to handle interpersonal conflicts within groups. We also use this model to generate suggested activites in the bucket list feature, where users can create a list of places they would like to visit, and provide suggestions for those places.
* Did you encounter any limitations? What were they, and how did you overcome them? Be specific

We faced the challenge of balancing time efficiency and accuracy in creating an itinerary. To ensure reliability, we opted for a sequential approach. This approach prevents duplication, which improves accuracy but increases the time required for creating the itinerary. On the other hand, a parallel approach would prioritize speed but may overlook the possibility of duplication.

## Contact Information
For business-related inquiries, please contact us at vacapal@outlook.com or vacapal01@gmail.com.