const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const fs = require('fs');
const uuid = require('uuid/v4');
const session = require('express-session');
var MongoClient = require('mongodb').MongoClient
const MongoDBStore = require('connect-mongodb-session')(session);

const saltRounds = 10;

const PORT = 5000;
const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
    collection: 'studentData'
  });

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    genid: (req) => {
      console.log('Session: ' + req.sessionID);
      return uuid();
    },
    store: store,
    secret: '-G1jZuu+WkmC0',
    resave: false,
    saveUninitialized: true,
    rolling: true,
  }));

//Custom middleware for handling login-requirement
app.use("/profile", (req, res, next) => {
    if (req.session.username) {
        next();
    } else {
        res.render('notlogged.ejs');
    }
});



app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/register", async (req, res) => {
    const file = fs.readFileSync("db.json", "utf-8");
    let tmp = JSON.parse(file);
    //console.log(req.body);
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    tmp.users = [...tmp.users, { username: req.body.username, email: req.body.email, password: hashedPassword}];
    fs.writeFileSync("db.json", JSON.stringify(tmp, null, 4));
    res.render('registered.ejs');
})

app.post("/login", (req, res) => {
    async function checkUser(username, password) {
        const file = fs.readFileSync("db.json", "utf-8");
        let tmp = JSON.parse(file);
    try {
        const usr = tmp.users.find(user => req.body.username === user.username);
        const match = await bcrypt.compare(password, usr.password);
        if(match) {
            req.session.username = usr.username;
            req.session.email = usr.email;
            console.log(req.session);
            res.render("logged.ejs");
        }else {
            res.render('notlogged.ejs');
        }
    }
    catch (err) {
        res.render('notlogged.ejs')
    }};
    checkUser(req.body.username, req.body.password)
});

app.get("/profile", (req, res) => {
    //console.log(req.session)
    res.render('profile.ejs', req.session);
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.render('index.ejs');
});

app.get("/profile/message", (req, res) => {
    res.render('message.ejs');
});

app.get("/profile/enroll", (req, res) => {
    res.render('enroll.ejs')
});

app.get('*', function(req, res){
    res.status(404).render('404.ejs');
  });



console.log("Listening port " + PORT);
app.listen(PORT);