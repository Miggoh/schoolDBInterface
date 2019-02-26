const express = require('express')
const router = express.Router()
const validator = require('validator'); //Form data validation and sanitization
const mongoose = require('mongoose'); //MongoDB object modeling
const Schema = mongoose.Schema;
const user = require('./user.js')

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

//Custom middleware for handling login-requirement
router.use("/", (req, res, next) => {
    req.session.reload(function(err) {
        if (req.session.username) {
            next();
        } else {
            res.render('notlogged.ejs');
        }
    });
});

//User requests profile:
router.get("/", (req, res) => {
    res.render('profile.ejs', req.session);
});

//User deletes account through modal:
router.post("/delete", async (req, res) => {
    await user.deleteOne({ username: req.session.username }, function(err) {
        if (!err) {
            res.redirect('/logout');
        }
        else {
            res.redirect('/error');
        }
    });
});

//User updates email through modal:
router.post("/email", async (req, res) => {
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

//Profile subpages:

//Enroll subpage:
router.route('/enroll')
.get(async (req, res) => {
    req.session.profileMessage = 'invisible';
    await courseList.findById( "5c7247cb1c9d4400008ea317", function (err, list) {
        if (err) console.log(err);
        if (list) {
            res.render('enroll.ejs', list);
        };
    });
})
.post(async (req, res) => {
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

//Message subpage:
router.route('/message')
    .get( (req, res) => {
    req.session.profileMessage = 'invisible';
    res.render('message.ejs');
})
    .post( (req, res) => {
    msg.create( {
        sender: req.session.username,
        recipient: validator.escape(req.body.teacher),
        email: req.session.email,
        subject: validator.escape(req.body.subject),
        message: validator.escape(req.body.message),
        unread: true,   
    });
    console.log(`New message from ${req.session.email}!`)
    req.session.profileMessage = 'visible';
    res.redirect('/profile');
});

module.exports = router;