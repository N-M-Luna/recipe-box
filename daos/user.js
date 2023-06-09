const User = require('../models/user');
const Recipe = require('../models/recipe');
const Ingredient = require('../models/ingredient');
const { default: mongoose } = require('mongoose');

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

//Gets user's menu (change recipe ids for recipes. And in the recipes, change ingredients' third element from ._id to .name)
module.exports.getMenu = async (email) => {
    return await User.aggregate([
        //Find the user by their email
        { $match :  { email } },
         //Keep only their menu
        { $project: { menu: true }},
        //Look up the recipe docs by ._id's in menu
        // { $lookup: {
        //        from: 'Recipe',
        //        localField: 'menu',
        //        foreignField: '_id',
        //        as: 'recipes'
        // }},
        //Keep only this array of recipe docs
        { $project: { recipes: true }},
        //Lookup the ingredients' name by ._ids in ingredients field.
        // { $lookup: {
        //     from: 'Ingredient',
        //     localField: 'recipes.ingredients', //????
        //     foreignField: '_id',
        //     as: 'ingredientObjs'
        // }},
     //Re-structure the docs: {recipes} -> {title, author, instructions, prepTime, ingredients: [ingr[0], ingr[1], ingredientObjs.name, cuisine}
    ]);
}

//Gets user's grocery list (change ingredients' third element from ._id to .name)
module.exports.getGroceryList = async (email) => {
    return await User.aggregate([
        //Find the user by their email
        { $match :  { email } },
         //Keep only their grocery list
        { $project: { groceryList: true }},
        //Lookup the ingredients' name by ._ids in ingredients field.
        // { $lookup: {
        //     from: 'Ingredient',
        //     localField: 'groceryList', //????
        //     foreignField: '_id',
        //     as: 'ingredientObjs'
        // }},
     //Re-structure the docs: {groceryList} -> {ingr[0], ingr[1], ingredientObjs.name}
]);
}

//Adds a recipe from the user's menu (and required ingredients from the user's grocery list)
module.exports.addRecipe = async (email, recipeID) => {
    //Check that the recipeID is a valid _id.
    if (!mongoose.Types.ObjectId.isValid(recipeID)) {
        return null;
    } else {
        //const ingredientsForRecipe = await Recipe.find({ _id: recipeID}).lean();
        //TODO add corresponding ingredients to groceryList
        return await User.updateOne({ email }, { $push: { menu:  new mongoose.Types.ObjectId(recipeID) } }).lean();
    }
}

//Removes a recipe from the user's menu (and required ingredients to the user's grocery list)
module.exports.removeRecipe = async (email, recipeID) => {
    if (!mongoose.Types.ObjectId.isValid(recipeID)) {
        return null;
    } else {
        //const ingredientsForRecipe = await Recipe.find({ _id: recipeID}).lean();
        //TODO remove corresponding ingredients from groceryList
        return await User.updateOne({ email }, { $pull: { menu: new mongoose.Types.ObjectId(recipeID) } }).lean();
    }
}

//Deletes all recipes from the user's menu (and corresponding ingredients to/from the user's grocery list)
module.exports.clearMenu = async (email) => {
    return await User.updateOne({ email }, { $set: { menu: [] } }).lean();
}
