const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, index: true },
    plural: { type: String, index: true },
});


module.exports = mongoose.model('ingredient', ingredientSchema);
