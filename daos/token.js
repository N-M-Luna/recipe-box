const Token = require('../models/token');
const uuid = require('uuid');

module.exports = {};

//Returns a string after creating a Token record
module.exports.makeTokenForUserId = async (userId) => {

    //Generate a token for user with ID: userId
    const token = uuid.v4();

    //Create a token that is associated with that user
    const newToken = await Token.create({token, userId});
    return newToken.token;
}

//Returns a userId string using the tokenString to get a Token record
module.exports.getUserIdFromToken = async (token) => {

    //Grab the token with the given tokenString
    const tokenInUse = await Token.findOne({token});

    //Return the userId associated with that token.
    return tokenInUse.userId;
}

//Deletes the corresponding Token record
module.exports.removeToken = async (token) => {
    return await Token.deleteOne({token});
}