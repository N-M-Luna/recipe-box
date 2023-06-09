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

//Deletes a user
module.exports.removeUser = async (userId) => {
    return await User.findOneAndDelete({_id: userId});
}

//Gets user's menu (change recipe ids for recipes. And in the recipes, change ingredients to be an array of strings)
//module.exports.getMenu = async (userId) => {}

//Adds a recipe from the user's menu (and required ingredients from the user's grocery list)
//module.exports.addRecipe = async (userId, recipeObj) => {} //Or recipeID

//Removes a recipe from the user's menu (and required ingredients to the user's grocery list)
//module.exports.removeRecipe = async (userId, recipeObj) => {} //Or recipeID

//Deletes all recipes from the user's menu (and corresponding ingredients to/from the user's grocery list)
//module.exports.clearMenu = async (userId) => {}
