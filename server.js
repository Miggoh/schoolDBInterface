const express=require("express"),app=express(),bodyParser=require("body-parser"),auth=require("./auth.js"),profile=require("./profile.js"),mongoose=require("mongoose"),uri="removed from github",options={dbName:"schoolDB",useNewUrlParser:!0},PORT=5e3;app.use(express.static(__dirname+"/public")),app.use(bodyParser.urlencoded({extended:!1})),app.use("/",auth),app.use("/profile",profile),app.get("/error",function(e,r){r.status(403).render("error.ejs")}),app.get("*",function(e,r){r.status(404).render("404.ejs")}),console.log("Listening port 5000"),app.listen(5e3),mongoose.connect(uri,options);