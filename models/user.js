const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    roles: { type: [String], required: true } //"regularUser" or "admin"
});


module.exports = mongoose.model("users", userSchema);