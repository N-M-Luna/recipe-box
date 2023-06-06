const Recipe = require('../models/recipe');

module.exports = {};

//Stores a recipe
module.exports.createRecipe = async (recipeObj) => {
    return await Recipe.create(recipeObj);
}

//Gets all recipes
module.exports.getAll = async () => {
    const recipesInDB = await Recipe.find();
    return recipesInDB;
}

//Gets a recipe by the title
module.exports.findByTitle = async (title) => {
    return await Recipe.findOne({title}).lean();
}