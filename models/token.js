const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    token: { type: String, required: true, index: true },
    userId: { type: String, required: true },//user's email
});


module.exports = mongoose.model("token", tokenSchema);