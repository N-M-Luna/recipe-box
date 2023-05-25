const User = require('../models/user');

module.exports = {};

//Stores a user record
module.exports.createUser = async (userObj) => {
    return await User.create(userObj);
}

//Gets a user record using their email
module.exports.getUser = async (email) => {
    return await User.findOne({email: email});
}

//Updates the user's password field
module.exports.updateUserPassword = async (email, password) => {
    return await User.updateOne({email}, {password});
}