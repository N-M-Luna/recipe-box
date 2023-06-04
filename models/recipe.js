const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true, index: true },
    author: { type: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, required: true, index: true },
    prepTime: { type: [Number], required: true },
    ingredients: { type: [{ type: mongoose.Schema.Types.Mixed }], required: true },
    cuisine: { type: [String], required: true }
});

/* Nat Note
If the syntax for ingredients is not correct, try:
ingredientAmounts: { type: [Number] },
ingredientUnits: { type: [String] },
ingredientsIds: { type:  [type: mongoose.Schema.Types.ObjectId, ref: 'ingredient'] }
*/
module.exports = mongoose.model('recipe', recipeSchema);
