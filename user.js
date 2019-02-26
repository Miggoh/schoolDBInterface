const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    courses: Array,
}, { collection: "studentData" });
const user = mongoose.model('user', userSchema);

module.exports = user;