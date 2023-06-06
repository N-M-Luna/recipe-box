const Ingredient = require('../models/ingredient');

module.exports = {};

//Create a new ingredient
module.exports.createIngredient = async (ingredientObj) => {
    return await Ingredient.create(ingredientObj);
}

//Find an ingredient by ID
module.exports.findById = async (ingredientID) => {
    return await Ingredient.findOne({_id: ingredientID});
}

//Find an ingredient by name
module.exports.findByName = async (ingredientName) => {
    return await Ingredient.findOne({name: ingredientName}).lean();
    /*
    const foundInSingularForm = await Ingredient.findOne({name: ingredientName}).lean();
    if (foundInSingularForm) {
        return foundInSingularForm;
    }
    const foundInPluralForm = await Ingredient.findOne({plural: ingredientName}).lean();
    return foundInPluralForm;
    */
}

//Get all ingredients (For testing)
module.exports.getAll = async () => {
    return await Ingredient.find().lean();
}