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
const uri = "removed from git"; //Connection url for database
const options = {
    dbName: "schoolDB",
    useNewUrlParser: true,
}

//Mongoose Schema:
const userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    courses: Array,
}, { collection: "studentData" });
const user = mongoose.model('user', userSchema);

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
    //console.log(req.session);
    res.render("index.ejs");
});

//User registers on main page:
app.post("/register", async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    await mongoose.connect(uri, options)
    .then(async () => { await user.findOne( { "username": req.body.username }, "username", function (err, response) {
        if (response) { res.render('notlogged.ejs') }
        else {
            user.create( {
                username: req.body.username,
                password: hashedPassword,
                email: req.body.email,
                courses: ["You haven't signed up for any courses yet!"]        
            });
            res.render('registered.ejs');
            }
        });
    });
});

//User logs in:
app.post("/login", (req, res) => {
    const checkUser = async (body) => {
        await mongoose.connect(uri, options)
        .then(async () => { await user.findOne( { "username": req.body.username }, "username password email courses", function (err, user) {
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
             }  else {
                res.render('notlogged.ejs');
             }
            }); 
        });
    };
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
app.get("/profile/enroll", (req, res) => {
    res.render('enroll.ejs')
});
app.post("/enroll", async (req, res) => {
    //console.log(req.body);
    await mongoose.connect(uri, options)
        .then(async () => { await user.findOne( { "username": req.session.username }, "courses", function (err, user) {
                if (err) console.log(err);
                if (user) {
                    user.courses= [req.body.lit, req.body.tech, req.body.psych];
                    user.save();
                    req.session.courses = [req.body.lit, req.body.tech, req.body.psych];
                    res.redirect('/profile');
                }
            });
        });
});

//User requests a page that doesn't exist:
app.get('*', function(req, res){
    res.status(404).render('404.ejs');
  });


//Server start:
console.log("Listening port " + PORT);
app.listen(PORT);