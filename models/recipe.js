const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true, index: true },
    author: { type: String, required: true, index: true },
    instructions: { type: String, required: true },
    prepTime: { type: [Number], required: true },
    ingredients: { type: [{ type: mongoose.Schema.Types.Mixed }], required: true },
    cuisine: { type: String, required: true }
});

recipeSchema.index({ title: 'text', instructions: 'text', cuisine: 'text' })

module.exports = mongoose.model('recipe', recipeSchema);
