const Recipe = require('../models/recipe');

module.exports = {};

//Stores a recipe
module.exports.createRecipe = async (recipeObj) => {
    return await Recipe.create(recipeObj);
}

//Gets a recipe by the title
module.exports.findByTitle = async (title) => {
    return await Recipe.findOne({title});
}
/*
//Updates the user's password field
module.exports.updateUserPassword = async (email, password) => {
    return await User.updateOne({email}, {password});
}

//Deletes a user
module.exports.removeUser = async (userId) => {
    return await User.findOneAndDelete({_id: userId});
}*/