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

//Gets all recipes by author
module.exports.getByAuthor = async (author) => {
    const recipesInDB = await Recipe.find({author});
    return recipesInDB;
}

//Gets a recipe by ID
module.exports.getbyId = async (recipeId) => {
    return await Recipe.findOne({ _id: recipeId }).lean();
}

//Gets a recipe by the title
module.exports.findByTitle = async (title) => {
    return await Recipe.findOne({title}).lean();
}

//Get recipes by search word
module.exports.getByQuery = async (searchWord) => {
    return await Recipe.find(
        { $text: { $search: searchWord } },
        { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).lean();
}

//Get recipes by ingredientID
//module.exports.getByIngredient = async (ingredientID) => {}
//[Nat Note]: I might need to re-structure the recipes to do this...? Or learn more about aggregation.

//Update recipe by ID
module.exports.updateByID = async (recipeId, newRecipe) => {
    return await Recipe.updateOne({_id: recipeId}, newRecipe);
}

//Delete recipe by ID
module.exports.deleteById = async (recipeId) => {
    return await Recipe.deleteOne({ _id: recipeId });
}