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
    const menuDocs = await User.aggregate([
        { $match:  { email } },
        { $project: { menu: true }}, // Docs returned: {menu: [recipeId_1, recipeId_2, ...]}
        { $lookup: //Look up the recipe docs by their ._id's in the menu field
            {
                from: 'Recipe',
                localField: 'menu', //array
                foreignField: '_id',
                //use pipeline to $lookup Ingredient docs?
                // pipeline: [{
                //     $lookup: {
                //         from: 'Ingredient',
                //         localField: '$recipes.ingredients[0]', //????
                //         foreignField: '_id',
                //         as: 'ingredientObjs'
                //     }
                // }],
               as: 'recipes'
            }
        },
        { $project: { recipes: true }},// Docs returned: {recipes: [fullRecipe_1, fullRecipe_2, ...]}
    ]);
    //console.log(menuDocs);
    return menuDocs;
}

//Gets user's grocery list (change ingredients' third element from ._id to .name)
module.exports.getGroceryList = async (email) => {

    //Grab the grocery list with ingredientIds
    const userInDB = (await User.aggregate([
        { $match:  { email } },
        { $project: { groceryList: true }}, //TRY: add a new ingredientID fields with the third element of each array in the groceryList field.
        // { $lookup: { //Lookup the ingredients' name by ._ids in ingredients field.
        //     from: 'Ingredient',
        //     localField: 'ingredientID',
        //     foreignField: '_id',
        //     pipeline: [{ $project: {name: true, _id: false}}],
        //     as: 'ingredientObjs'
        // }},
    ]))[0];
    let ingredients = userInDB.groceryList;

    //Grab the ingredient IDs
    const ingredientIDs = []
    for (let i = 0; i < ingredients.length; i++) {
        ingredientIDs.push(ingredients[i][2]);
    }
    //Grab the ingredient names
    const ingredientNames = await Ingredient.aggregate([
        { $match: { _id: { $in: ingredientIDs } }}
    ]);

    //Replace the third element of each array in the groceryList field with each string in the ingredientNames array.
    let ingredientStr
    const groceryList = []
    for (let i = 0; i < ingredientNames.length; i++) {
        ingredientStr = ingredients[i][0].toString();
        if (ingredients[i][1].length > 0) {
            ingredientStr += ` ${ingredients[i][1]}`
        }
        ingredientStr += ` ${ingredientNames[i].name}`
        console.log(ingredientStr)
        groceryList.push(ingredientStr);
        console.log(groceryList)
    }
    return groceryList;
}

//Adds a recipe from the user's menu (and required ingredients from the user's grocery list)
module.exports.addRecipe = async (email, recipeID) => {
    //Check that the recipeID is a valid _id.
    if (!mongoose.Types.ObjectId.isValid(recipeID)) {
        return null;
    } else {
        const recipeInDocs = (await Recipe.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(recipeID)} },
            { $project: { ingredients: true } },
        ]))[0];
        const ingredientsInRecipe = recipeInDocs.ingredients;
        return await User.updateOne({ email }, { $push: { menu:  new mongoose.Types.ObjectId(recipeID) }, $set: {groceryList: ingredientsInRecipe  } }).lean();
    }
}

//Removes a recipe from the user's menu (and required ingredients to the user's grocery list)
module.exports.removeRecipe = async (email, recipeID) => {
    if (!mongoose.Types.ObjectId.isValid(recipeID)) {
        return null;
    } else {
        const recipeInDocs = await Recipe.findOne({ _id: recipeID }).lean();
        const ingredientsInRecipe = recipeInDocs.ingredients;
        return await User.updateOne({ email }, { $pull: { menu: new mongoose.Types.ObjectId(recipeID) , groceryList: { $in: ingredientsInRecipe } } }).lean();
    }
}

//Deletes all recipes from the user's menu (and corresponding ingredients from the user's grocery list)
module.exports.clearMenu = async (email) => {
    return await User.updateOne({ email }, { $set: { menu: [] } }).lean();
}
