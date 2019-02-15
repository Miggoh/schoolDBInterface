const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const fs = require('fs');

const saltRounds = 10;

const PORT = 5000;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/register", async (req, res) => {
    res.send('ty for register');
})

app.post("/login", (req, res) => {
    console.log(req.body);
    res.send('ty for login');
})



console.log("Listening port " + PORT);
app.listen(PORT);