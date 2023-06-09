const { Router } = require('express');
const router = Router();
const { isAuthenticated } = require('./middleware');
const userDAO = require('../daos/user');
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

            //For each ingredient in the recipe, get its _id in the DB
            const ingredientsForDB = []
            for (let i = 0; i < ingredients.length; i++) {
                const ingredientInDB = await ingredientDAO.findByName(ingredients[i][2]);
                if (ingredientInDB) {
                    ingredientsForDB.push([ingredients[i][0], ingredients[i][1], ingredientInDB._id]);

                } else { //If it does not exists in the DB, create a new Ingredient doc for it and get its _id.
                    const newIngredient = await ingredientDAO.createIngredient({ name: ingredients[i][2] });
                    ingredientsForDB.push([ingredients[i][0], ingredients[i][1], newIngredient._id]);
                }
            }

            //Send the complete recipe object to be written in the DB
            const completeRecipe = {title, author: req.userId, instructions, prepTime, ingredients: ingredientsForDB, cuisine};
            try {
                const newRecipe = await recipeDAO.createRecipe(completeRecipe);
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
*/
router.get('/', async (req, res, next) => {
    try {
        //Grabs the recipes from the DB
        let recipesInDB = await recipeDAO.getAll();

        //Replaces the array of [int, unit, _id] arrays with a string.
        for (let rIndex = 0; rIndex < recipesInDB.length; rIndex++) {
            for (let iIndex = 0; iIndex < recipesInDB[rIndex].ingredients.length; iIndex++) {

                //Find ingredient in the DB
                const thisIngredient = recipesInDB[rIndex].ingredients[iIndex]
                const ingredientID = thisIngredient[2];
                const ingredientObj = await ingredientDAO.findById(ingredientID);

                //Build string that will replace each ingredient array
                let ingredientString = thisIngredient[0].toString() + ` `
                if (thisIngredient[1].length > 0) {
                    ingredientString += `${thisIngredient[1]} `
                }
                ingredientString += ingredientObj.name;

                //Replace the ingredient array with the string
                recipesInDB[rIndex].ingredients[iIndex] = ingredientString;
            }
        }

        //Returns all recipes
        res.status(200).send(recipesInDB);
    } catch (e) {
        next(e);
    }
})

/* GET /search
Reads all recipes that match a query (by text search or by ingredientID)
*/
router.get('/search', async (req, res, next) => {
  const {ingredient, query} = req.query;
  try {
    let queryResponse;

    if (ingredient) {
        const ingredientID = await ingredientDAO.findByName(ingredient);
        if (ingredientID) {
            queryResponse = await recipeDAO.getByIngredient(ingredientID);
        } else {
            queryResponse = {}
        }

    } else if (query) {
        queryResponse = await recipeDAO.getByQuery(query);
    } else {

    }
    res.status(200).send(queryResponse);
  } catch(e) {
    next(e);
  }
})

/* GET /:userId
Reads all recipes by user with id: userId.
*/
router.get('/:userId', async (req, res, next) => {
    //Grab userId from req.params
    //Grabs all recipes, filtering by userId, replacing the array of [int, unit, _id] arrays with a string.
    //Returns the recipes
    try {
        //Grabs the recipes from the DB
        let recipesInDB = await recipeDAO.getByAuthor(req.params.userId);

        //Replaces the array of [int, unit, _id] arrays with a string.
        for (let rIndex = 0; rIndex < recipesInDB.length; rIndex++) {
            for (let iIndex = 0; iIndex < recipesInDB[rIndex].ingredients.length; iIndex++) {

                //Find ingredient in the DB
                const thisIngredient = recipesInDB[rIndex].ingredients[iIndex]
                const ingredientID = thisIngredient[2];
                const ingredientObj = await ingredientDAO.findById(ingredientID);

                //Build string that will replace each ingredient array
                let ingredientString = thisIngredient[0].toString() + ` `
                if (thisIngredient[1].length > 0) {
                    ingredientString += `${thisIngredient[1]} `
                }
                ingredientString += ingredientObj.name;

                //Replace the ingredient array with the string
                recipesInDB[rIndex].ingredients[iIndex] = ingredientString;
            }
        }

        //Returns all recipes
        res.status(200).send(recipesInDB);
    } catch (e) {
        next(e);
    }
})

/* GET /full/:recipeId
Reads recipe with id: recipeId
router.get('/full/:recipeId', async (req, res, next) => {
    try {
        const fullRecipe = await recipeDAO.getbyId(req.params.recipeId);
        if (fullRecipe) {
            res.status(200).send(fullRecipe);
        } else {
            res.status(404).send('Found no recipe with that ID.')
        }
    } catch(e) {
        next(e);
    }
})
*/

/* PUT /:recipeId
Updates an existing recipe.
Authenticated users can update only their own recipes.
*/
router.put('/:recipeId', isAuthenticated, async (req, res, next) => {
    try{
        //Check that the body is not empty
        const recipeUpdates = req.body;
        if (!recipeUpdates || JSON.stringify(recipeUpdates)==='{}') {
            res.status(400).send(`Missing updates to the recipe.`);

        } else {
            const recipeId = req.params.recipeId;
            const recipeInDB = await recipeDAO.getbyId(recipeId);

            //If author is same as req.userId, update recipe
            if (recipeInDB.author === req.userId) {
                const updatedRecipe = await recipeDAO.updateByID(recipeId, recipeUpdates);
                res.status(200).send(updatedRecipe);
            } else {

                //If not, return 403
                res.status(403).send(`User not authorized to change recipe.`);
            }
        }
    } catch(e) {
        next(e);
    }
})

/* DELETE /:recipeId
Deletes a recipe.
Authenticated users can delete their own recipes.
Authorized users can delete any recipe.
*/
router.delete('/:recipeId', isAuthenticated, async (req, res, next) => {
    try {
        //Grab user from req.userId
        const userId = req.userId;
        const user = await userDAO.getUser(userId);
        //and recipe from req.params
        const recipeId = req.params.recipeId;
        const recipe = await recipeDAO.getbyId(recipeId);


        //If user is admin OR if user is same as recipe author, delete the recipe.
        if (recipe.author === user.email || user.roles.includes('admin')) {
            await recipeDAO.deleteById(recipeId);
            res.sendStatus(200);
        } else {

            //If not, return 403
            res.status(403).send(`User is not authorized to delete this recipe.`);
        }
    } catch (e) {
        next(e);
    }
})


module.exports = router;