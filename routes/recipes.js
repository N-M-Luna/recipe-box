const { Router } = require('express');
const router = Router();
const {isAuthenticated, isAuthorized} = require('./middleware');
const userDAO = require('../daos/user');
const recipeDAO = require('../daos/recipe');


/* POST /
If user is autheticated, creates a new recipe.

router.post('/', isAuthenticated, async (req, res, next) => {
    //From req.body:
    //Grabs strings title, prepTime, and cuisine.
    //Grabs the amount (number), unit (string), and ingredient (string).
    //Search for the ingredient doc. If it does not exists, create a new doc for it. Swap the ingredient string with the _id.
    //From req.userId, grabs auhtorId.
})
*/

/* GET /
Reads all the recipes.
Returns recipe objects after swapping the ingredients field with an array of strings that describe the ingredients and their quantities.

router.get('/', async (req, res, next) => {
    //Grabs the recipes, replacing the array of [int, unit, _id] arrays with a string.
    //Returns all recipes
})
*/

/* GET /:userId
Reads all recipes by user with id: userId.

router.get('/:userId', async (req, res, next) => {
    //Grab userId from req.params
    //Grabs all recipes, filtering by userId, replacing the array of [int, unit, _id] arrays with a string.
    //Returns the recipes
})
*/

/* GET /search
Reads all recipes that match a query (by text search or by ingredient)

router.get('/search', async (req, res, next) => {
    //Use aggregation for text search and lookup for ingredient?
})
*/

/* PUT /:recipeId
Updates an existing recipe.
Authenticated users can update only their own recipes.

router.put('/:recipeId', isAuthenticated, async (req, res, next) => {
    //If author is same as req.userId, update recipe
    //If not, return 403
})
*/

/* DELETE /:recipeId
Deletes a recipe.
Authenticated users can delete their own recipes.
Authorized users can delete any recipe.

router.delete('/:recipeId', isAuthenticated, async (req, res, next) => {
    //Grab user from req.userId and recipe from req.params
    //If user is admin OR if user is same as recipe author, delete the recipe.
    //If not, return 403
})
*/

module.exports = router;