const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const fs = require('fs');
const uuid = require('uuid/v4');
const session = require('express-session');
const fileStore = require('session-file-store')(session);

const saltRounds = 10;

const PORT = 5000;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    genid: (req) => {
      console.log('Session: ' + req.sessionID);
      return uuid();
    },
    store: new fileStore(),
    secret: '-G1jZuu+WkmC0',
    resave: true,
    saveUninitialized: true,
  }));



app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/register", async (req, res) => {
    const file = fs.readFileSync("db.json", "utf-8");
    let tmp = JSON.parse(file);
    console.log(req.body);
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    tmp.users = [...tmp.users, { username: req.body.username, email: req.body.email, password: hashedPassword}];
    fs.writeFileSync("db.json", JSON.stringify(tmp, null, 4));
    res.render('registered.ejs');
})

app.post("/login", (req, res) => {
    async function checkUser(username, password) {
        const file = fs.readFileSync("db.json", "utf-8");
        let tmp = JSON.parse(file);
        const usr = tmp.users.filter(user => user.username === req.body.username)[0];
        const match = await bcrypt.compare(password, usr.password);
        if(match) {
            req.session.cookie.secure = true;
            req.session.cookie.username = usr.username;
            req.session.cookie.email = usr.email;
            console.log(req.session);
            res.render("logged.ejs");
        }else {
            res.send('no u');
        }
    }
    checkUser(req.body.username, req.body.password)
})

app.post("/profile", (req, res) => {
    console.log(req.session)
    res.render('profile.ejs', req.session);
})

app.get('*', function(req, res){
    res.status(404).render('404.ejs');
  });



console.log("Listening port " + PORT);
app.listen(PORT);