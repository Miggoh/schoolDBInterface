const express=require("express"),router=express.Router(),validator=require("validator"),mongoose=require("mongoose"),Schema=mongoose.Schema,user=require("./user.js"),courseSchema=new Schema({lit:Array,tech:Array,psych:Array},{collection:"courseData"}),courseList=mongoose.model("course",courseSchema),messageSchema=new Schema({sender:String,date:{type:Date,default:Date.now},recipient:String,email:String,subject:String,message:String,unread:Boolean},{collection:"messageData"}),msg=mongoose.model("msg",messageSchema);router.use("/",(e,s,r)=>{e.session.reload(function(o){e.session.username?r():s.render("notlogged.ejs")})}),router.get("/",(e,s)=>{s.render("profile.ejs",e.session)}),router.post("/delete",async(e,s)=>{await user.deleteOne({username:e.session.username},function(e){e?s.redirect("/error"):s.redirect("/logout")})}),router.post("/email",async(e,s)=>{/^\S+@\S+\.\S+$/.test(e.body.email)?await user.findOne({username:e.session.username},function(r,o){r?s.redirect("/error"):(o.email=e.body.email,o.save(),e.session.email=e.body.email,s.redirect("/profile"))}):s.redirect("/error")}),router.route("/enroll").get(async(e,s)=>{e.session.profileMessage="invisible",await courseList.findById("5c7247cb1c9d4400008ea317",function(e,r){e&&console.log(e),r&&s.render("enroll.ejs",r)})}).post(async(e,s)=>{await courseList.findById("5c7247cb1c9d4400008ea317",async function(r,o){r&&console.log(r),o&&-1!=o.lit.indexOf(e.body.lit)&&-1!=o.tech.indexOf(e.body.tech)&&-1!=o.psych.indexOf(e.body.psych)?await user.updateOne({username:e.session.username},{courses:[e.body.lit,e.body.tech,e.body.psych]},function(r){r&&console.log(r),e.session.courses=[e.body.lit,e.body.tech,e.body.psych],s.redirect("/profile")}):s.redirect("/error")})}),router.route("/message").get((e,s)=>{e.session.profileMessage="invisible",s.render("message.ejs")}).post((e,s)=>{msg.create({sender:e.session.username,recipient:validator.escape(e.body.teacher),email:e.session.email,subject:validator.escape(e.body.subject),message:validator.escape(e.body.message),unread:!0}),console.log(`New message from ${e.session.email}!`),e.session.profileMessage="visible",s.redirect("/profile")}),module.exports=router;