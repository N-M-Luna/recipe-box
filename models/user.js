const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    roles: { type: [String], required: true }, //"regularUser" or "admin"
    menu: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'recipe' }] },
    groceryList: { type: [mongoose.Schema.Types.Mixed] }
});

/* Nat Note.
If the syntax for groceryList is not correct, try:
groceryListAmounts: { type: Number },
groceryListUnits: { type: String },
groceryListIngredients: { type: { type: mongoose.Schema.Types.ObjectId, ref: 'ingredient' } }
*/
module.exports = mongoose.model('user', userSchema);
