//Node modules:
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt'); //Password encryption
const validator = require('validator'); //Form data validation and sanitization
const uuid = require('uuid/v4'); //Generating unique session IDs
const session = require('express-session'); //Session library
const mongoose = require('mongoose'); //MongoDB object modeling
const MongoDBStore = require('connect-mongodb-session')(session); //Stores sessions to database
const Schema = mongoose.Schema;
const uri = "removed from github"; //Connection url for database
const options = { //arguments for Mongoose connection
    dbName: "schoolDB",
    useNewUrlParser: true,
};

//Mongoose Schemas:
const userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    courses: Array,
}, { collection: "studentData" });
const user = mongoose.model('user', userSchema);

const courseSchema = new Schema({
    lit: Array,
    tech: Array,
    psych: Array,
}, { collection: "courseData" });
const courseList = mongoose.model('course', courseSchema);

const messageSchema = new Schema({
    sender: String,
    date: { type: Date, default: Date.now },
    recipient: String,
    email: String,
    subject: String,
    message: String,
    unread: Boolean
}, { collection: "messageData" });
const msg = mongoose.model('msg', messageSchema);

//Salt setting for bcrypt:
const saltRounds = 10;

//App port:
const PORT = 5000;

//MongoDBStore config:
const store = new MongoDBStore({
    uri: uri,
    databaseName: 'schoolDB',
    collection: 'sessionData'
  });

//Middleware:
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));

//Session config:
app.use(session({
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

//Custom middleware for handling login-requirement
app.use("/profile", (req, res, next) => {
    req.session.reload(function(err) {
        if (req.session.username) {
            next();
        } else {
            res.render('notlogged.ejs');
        }
    });
});


//GET main page:
app.get("/", (req, res) => {
    if (req.session.username) { //Checking if user is already logged in and redirecting to profile page instead if true.
        res.redirect("/profile");
    } else {
        res.render("index.ejs");
    }
});

//User registers on main page:
app.post("/register", async (req, res) => {
    if ( validator.isAlphanumeric(req.body.username) && /^\S+@\S+\.\S+$/.test(req.body.email) ) { //Validator.js doesn't accept domains that end with two letters (.fi for example), so using RegExp for now. 
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds); //Encrypting password. Password is not validated as it's only saved as a hash.
        await user.findOne( { "username": req.body.username.toLowerCase() }, "username", function (err, response) { //Checking if username already exists in the database.
            if (response) { res.render("failedregister.ejs") } 
            else { //Creating a new user if all the information is valid.
                user.create( {
                    username: req.body.username.toLowerCase(),
                    password: hashedPassword,
                    email: req.body.email.toLowerCase(),
                    courses: ["You haven't signed up for any courses yet!"]        
                });
                res.render('registered.ejs');
                }
            });
        } else {
            res.render('failedregister.ejs');
        };
    });

//User logs in:
app.post("/login", (req, res) => {
    const checkUser = async (body) => {
        await user.findOne( { "username": req.body.username.toLowerCase() }, "username password email courses", function (err, user) { //Checking if user exists and fetching data.
            if (err) console.log(err);
            if (user) {
                const match = bcrypt.compare(req.body.password, user.password); //Checking if the password entered matches the hash stored in database.
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
        
       
        

//User requests profile:
app.get("/profile", (req, res) => {
    res.render('profile.ejs', req.session);
});

//Logout through nav:
app.get("/logout", (req, res) => {
    req.session.regenerate();
    res.render('loggedout.ejs');
});

//Profile subpages. Login required to view:
app.get("/profile/message", (req, res) => {
    req.session.profileMessage = 'invisible'
    res.render('message.ejs');
});

app.post("/message", (req, res) => {
    msg.create( {
        sender: req.session.username,
        recipient: validator.escape(req.body.teacher),
        email: req.session.email,
        subject: validator.escape(req.body.subject),
        message: validator.escape(req.body.message),
        unread: true,   
    });
    console.log(`New message from ${req.session.email}!`)
    req.session.profileMessage = 'visible'
    res.redirect('/profile');
})

app.post("/delete", async (req, res) => {
    await user.deleteOne({ username: req.session.username }, function(err) {
        if (!err) {
            res.redirect('/logout');
        }
        else {
            res.redirect('/error');
        }
    });
});


app.post("/email", async (req, res) => {
    if(/^\S+@\S+\.\S+$/.test(req.body.email)) {
        await user.findOne({ username: req.session.username }, function(err, user) {
            if (!err) {
                user.email = req.body.email;
                user.save();
                req.session.email = req.body.email;
                res.redirect('/profile');
            }
            else {
                res.redirect('/error');
            };
        });
    } else {
        res.redirect('/error');
    }
});


app.get("/profile/enroll", async (req, res) => {
    req.session.profileMessage = 'invisible'
    await courseList.findById( "5c7247cb1c9d4400008ea317", function (err, list) {
        if (err) console.log(err);
        if (list) {
            res.render('enroll.ejs', list);
        };
    });
});

app.post("/enroll", async (req, res) => {
    await courseList.findById( "5c7247cb1c9d4400008ea317", async function (err, list) {
        if (err) console.log(err);
        if (list) {
            if (list.lit.indexOf(req.body.lit) != -1 && list.tech.indexOf(req.body.tech) != -1 && list.psych.indexOf(req.body.psych) != -1) {
                await user.updateOne( { "username": req.session.username }, { courses: [req.body.lit, req.body.tech, req.body.psych] }, function (err) {
                    if (err) console.log(err);
                    req.session.courses = [req.body.lit, req.body.tech, req.body.psych];
                    res.redirect('/profile');
                });
            } else {
                res.redirect('/error');
            };
        } else {
            res.redirect('/error');
        };
    });
});

app.get('/error', function(req, res){
    res.status(403).render('error.ejs');
  });

//User requests a page that doesn't exist:
app.get('*', function(req, res){
    res.status(404).render('404.ejs');
  });


//Server start:
console.log("Listening port " + PORT);
app.listen(PORT);
mongoose.connect(uri, options);