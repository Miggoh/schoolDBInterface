const express = require('express');
const router = express.Router();
const uuid = require('uuid/v4'); //Generating unique session IDs
const session = require('express-session'); //Session library
const bcrypt = require('bcrypt'); //Password encryption
const validator = require('validator'); //Form data validation and sanitization
const user = require('./user.js') //schema for mongoose
const MongoDBStore = require('connect-mongodb-session')(session); //Stores sessions to database
const uri = process.env.MONGODB_URI; //Connection url for database

//MongoDBStore config:
const store = new MongoDBStore({
    uri: uri,
    databaseName: 'schoolDB',
    collection: 'sessionData'
  });

//Session config:
router.use(session({
    genid: (req) => {
      return uuid();
    },
    store: store,
    secret: '-G1jZuu+WkmC0',
    resave: true,
    saveUninitialized: true,
    rolling: true,
    cookie: {
        maxAge: 360000,
    }
}));

//Salt setting for bcrypt:
const saltRounds = 10;

//GET main page:
router.get("/", (req, res) => {
    if (req.session.username) { //Checking if user is already logged in and redirecting to profile page instead if true.
        res.redirect("/profile");
    } else {
        res.render("index.ejs");
    }
});

//User registers on main page:
router.post("/register", async (req, res) => {
    if ( validator.isAlphanumeric(req.body.username) && /^\S+@\S+\.\S+$/.test(req.body.email) ) { //Validator.js doesn't accept domains that end with two letters (.fi for example), so using RegExp for now. 
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds); //Encrypting password. Password is not validated as it's only saved as a hash.
        await user.findOne( { "username": req.body.username.toLowerCase() }, "username", function (err, response) { //Checking if username already exists in the database.
            if (response) { res.render("failedregister.ejs") } 
            else { //Creating a new user if all the information is valid.
                user.create( {
                    username: req.body.username.toLowerCase(),
                    password: hashedPassword,
                    email: req.body.email.toLowerCase(),
                    courses: ["You haven't signed up for any courses yet!"], 
                });
                res.render('registered.ejs');
                }
            });
        } else {
            res.render('failedregister.ejs');
        };
    });

//User logs in:
router.post("/login", (req, res) => {
    const checkUser = async (body) => {
        await user.findOne( { "username": req.body.username.toLowerCase() }, "username password email courses", async function (err, user) { //Checking if user exists and fetching data.
            if (err) console.log(err);
            if (user) {
                const match = await bcrypt.compare(req.body.password, user.password); //Checking if the password entered matches the hash stored in database.
                if(match) { //If yes, logging the user in and setting session values.
                    req.session.username = user.username;
                    req.session.email = user.email;
                    req.session.courses = user.courses;
                    req.session.profileMessage = 'invisible';
                    res.render('logged.ejs');
                }else {
                    res.render('notlogged.ejs');
                };
            } else {
                res.render('notlogged.ejs');
             }
        }
    )}
    checkUser(req.body);
});

//Logout through nav:
router.get("/logout", (req, res) => {
    req.session.destroy();
    res.render('loggedout.ejs');
});

module.exports = router;