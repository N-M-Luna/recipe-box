const { Router } = require('express');
const router = Router();
const {isAuthenticated, isAuthorized} = require('./middleware');
const userDAO = require('../daos/user');
const tokenDAO = require('../daos/token');
const recipeDAO = require('../daos/recipe');
const ingredientDAO = require('../daos/ingredient');

/* POST /
If user is autheticated, creates a new recipe.
*/
router.post('/', isAuthenticated, async (req, res, next) => {

    //Check that the request body has (non-empty) title, prepTime, instructions, ingredients, and cuisine.
    let { title, prepTime, instructions, ingredients, cuisine } = req.body;
    if (title === null || title === '' || prepTime === null || prepTime === '' || instructions === null || instructions === '' || ingredients === null || ingredients === '' || cuisine === null || cuisine === '') {
        res.status(400).send('Missing some recipe info.')

    } else {
        //Check that the recipe is not already in the DB
        const alreadyInDB = await recipeDAO.findByTitle(title);
        if (alreadyInDB) {
            res.status(409).send(`Recipe already in DB`);
        } else {

            //Swap the ingredient name (string) for its _id.
            //(Create a new Ingredient doc for each element that does not exist)
            ingredients.forEach(async (i) => {
                const ingredientInDB = await ingredientDAO.findByName(i[2]);
                if (ingredientInDB) {
                    i[2] = ingredientInDB._id;
                } else {
                    const newIngredient = await ingredientDAO.createIngredient({ name: i[2] });
                    i[2] = newIngredient._id;
                }
            })

            //Grab the recipe's author
            const author = req.userId;

            //Send the complete recipe object to be written in the DB
            try {
                const newRecipe = await recipeDAO.createRecipe({ title, author, prepTime, ingredients, cuisine });
                res.status(200).send(newRecipe);
            } catch (e) {
                next(e);
            }
        }
    }


})


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