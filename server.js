//Node modules:
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const auth = require('./auth.js');
const profile = require('./profile.js')
const mongoose = require('mongoose'); //MongoDB object modeling
const uri = "mongodb+srv://schoolAdmin:TMTFDU533XGL2Q6F@schooldb-zgp5j.mongodb.net"; //Connection url for database
const options = { //arguments for Mongoose connection
    dbName: "schoolDB",
    useNewUrlParser: true,
};

//App port:
const PORT = 5000;

//Middleware:
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));

//Routers:
app.use('/', auth)
app.use('/profile', profile)

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