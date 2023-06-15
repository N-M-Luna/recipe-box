const User = require('../models/user');
const Recipe = require('../models/recipe');
const Ingredient = require('../models/ingredient');
const mongoose = require('mongoose');

module.exports = {};

//Stores a user record
module.exports.createUser = async (userObj) => {
    return await User.create(userObj);
}

//Gets a user record using their email
module.exports.getUser = async (email) => {
    return await User.findOne({ email });
}

//Updates the user's password field
module.exports.updateUserPassword = async (email, password) => {
    return await User.updateOne({email}, {password});
}

//Deletes a user
module.exports.removeUser = async (email) => {
    return await User.deleteOne({ email });
}

//Gets user's menu (change recipe ids for recipes. And in the recipes, change ingredients' third element from ._id to .name)
module.exports.getMenu = async (email) => {

    //Grab the recipes on the menu
    const userInDB = (await User.aggregate([
        { $match:  { email } },
        // { $lookup: {
        //        from: 'recipe',
        //        localField: 'menu',
        //        foreignField: '_id',
        //        as: 'recipeList'
        // }, }, //BUG??? Nothing is coming through
        //{ $project: { menu: '$recipeList', groceryList: true, _id: false }},
    ]))[0];
    //let menu = userInDB.menu;
    let menu = await Recipe.aggregate([
        { $match: { _id: { $in: userInDB.menu }} },
    ]);

    //Grab the ingredient names
    let ingredientIDs = userInDB.groceryList.flatMap(ingredient => ingredient[2]);
    const ingredientNames = await Ingredient.aggregate([
        { $match: { _id: { $in: ingredientIDs } }},
        { $project: { name: true, _id: false }}
    ]);

    //Replace the third element of each menu ingredients array with the strings in the ingredientNames array.
    let ingredientStr, j=0, k=-1
    for (let i = 0; i < ingredientNames.length; i++) {
        if (k+1 >= menu[j].ingredients.length) {
            j++;
            k=0;
        } else {
            k++;
        }
        ingredientStr = menu[j].ingredients[k][0].toString();
        if (menu[j].ingredients[k][1].length > 0) {
            ingredientStr += ` ${menu[j].ingredients[k][1]}`;
        }
        ingredientStr += ` ${ingredientNames[i].name}`;
        menu[j].ingredients[k] = ingredientStr;
    }
    return menu;
}

//Gets user's grocery list (change ingredients' third element from ._id to .name)
module.exports.getGroceryList = async (email) => {

    //Grab the grocery list with ingredientIds
    const userInDB = (await User.aggregate([
        { $match:  { email } },
        { $project: { groceryList: true }}, //TRY: add a new ingredientID fields with the third element of each array in the groceryList field.
        // { $lookup: { //TRY: Lookup the ingredients' name with the ingredientID field.
        //     from: 'Ingredient',
        //     localField: 'ingredientID',
        //     foreignField: '_id',
        //     pipeline: [{ $project: {name: true, _id: false}}],
        //     as: 'ingredientNames'
        // }},
        // {...?} //TRY: Re-write the third element of each array[i] in the groceryList field with the string[i] in the ingredientNames field.
    ]))[0];
    let ingredients = userInDB.groceryList;

    //Grab the ingredient IDs and names
    const ingredientIDs = ingredients.flatMap(ingredient => ingredient[2]);
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
        groceryList.push(ingredientStr);
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
        return await User.updateOne({ email }, { $push: { menu:  recipeID }, $set: {groceryList: ingredientsInRecipe  } }).lean();
    }
}

//Removes a recipe from the user's menu (and required ingredients to the user's grocery list)
module.exports.removeRecipe = async (email, recipeID) => {
    if (!mongoose.Types.ObjectId.isValid(recipeID)) {
        return null;
    } else {
        const recipeInDocs = await Recipe.findOne({ _id: recipeID }).lean();
        const ingredientsInRecipe = recipeInDocs.ingredients;
        return await User.updateOne({ email }, { $pull: { menu: recipeID , groceryList: { $in: ingredientsInRecipe } } }).lean();
    }
}

//Deletes all recipes from the user's menu (and corresponding ingredients from the user's grocery list)
module.exports.clearMenu = async (email) => {
    return await User.updateOne({ email }, { $set: { menu: [] } }).lean();
}
