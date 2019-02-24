//Node modules:
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt'); //Password encryption
const uuid = require('uuid/v4'); //Generating unique session IDs
const session = require('express-session'); //Session library
const mongoose = require('mongoose'); //MongoDB onject modeling
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
}, { collection: "studentData" });
const courseList = mongoose.model('course', courseSchema);

//Salt setting for bcrypt:
const saltRounds = 10;

//App port:
const PORT = 5000;

//MongoDBStore config:
const store = new MongoDBStore({
    uri: uri,
    databaseName: 'schoolDB',
    collection: 'studentData'
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
    if (req.session.username) {
        res.redirect("/profile")
    } else {
        res.render("index.ejs");
    }
});

//User registers on main page:
app.post("/register", async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    await user.findOne( { "username": req.body.username.toLowerCase() }, "username", function (err, response) {
        if (response) { res.render('notlogged.ejs') }
        else {
            user.create( {
                username: req.body.username.toLowerCase(),
                password: hashedPassword,
                email: req.body.email.toLowerCase(),
                courses: ["You haven't signed up for any courses yet!"]        
            });
            res.render('registered.ejs');
            }
        });
    });

//User logs in:
app.post("/login", (req, res) => {
    const checkUser = async (body) => {
        await user.findOne( { "username": req.body.username.toLowerCase() }, "username password email courses", function (err, user) {
            if (err) console.log(err);
            if (user) {
                const match = bcrypt.compare(req.body.password, user.password);
                if(match) {
                    req.session.username = user.username;
                    req.session.email = user.email;
                    req.session.courses = user.courses;
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
    //console.log(req.session)
    res.render('profile.ejs', req.session);
});

//Logout through nav:
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.render('index.ejs');
});

//Profile subpages. Login required to view:
app.get("/profile/message", (req, res) => {
    res.render('message.ejs');
});

app.post("/delete", async (req, res) => {
    await user.deleteOne({ username: req.session.username }, function(err) {
        if (!err) {
            res.redirect('/logout');
        }
        else {
            res.redirect('/profile');
        }
    });
});


app.post("/email", async (req, res) => {
        await user.findOne({ username: req.session.username }, function(err, user) {
        if (!err) {
            user.email = req.body.email;
            user.save();
            req.session.email = req.body.email;
            res.redirect('/profile');
        }
        else {
            res.redirect('/profile');
        }
    });
});


app.get("/profile/enroll", async (req, res) => {
    await courseList.findById( "5c71d4291c9d440000b4a556", function (err, list) {
        if (err) console.log(err);
        if (list) {
            res.render('enroll.ejs', list);
        };
    });
});

app.post("/enroll", async (req, res) => {
    //console.log(req.body);
    await user.findOne( { "username": req.session.username }, "courses", function (err, user) {
        if (err) console.log(err);
        if (user) {
            user.courses= [req.body.lit, req.body.tech, req.body.psych];
            user.save();
            req.session.courses = [req.body.lit, req.body.tech, req.body.psych];
            res.redirect('/profile');
            }
    });
});

//User requests a page that doesn't exist:
app.get('*', function(req, res){
    res.status(404).render('404.ejs');
  });


//Server start:
console.log("Listening port " + PORT);
app.listen(PORT);
mongoose.connect(uri, options);