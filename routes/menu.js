const { Router } = require('express');
const router = Router();
const {isAuthenticated} = require('./middleware');
const userDAO = require('../daos/user');

/* GET /
Gets the (authenticated) user's menu.
*/
router.get('/', isAuthenticated, async (req, res, next) => {
    try {
        const userEmail = req.userId;
        const userMenu = await userDAO.getMenu(userEmail);
        //console.log(userMenu)
        //Change ingredients field (from array of three strings to a readable string)
        if (userMenu) {
            res.status(200).send(userMenu);
        } else {
            res.status(404).send('Menu not found');
        }
    } catch (e) {
        next(e);
    }
});

/* GET /grocery-list
Gets the (authenticated) user's grocery list.
*/
router.get('/grocery-list', isAuthenticated, async (req, res, next) => {
    const userEmail = req.userId;
    try {
        const groceryList = await userDAO.getGroceryList(userEmail);
        if (groceryList) {
            res.status(200).send(groceryList);
        } else {
            res.status(404).send('Grocery list not found');
        }
    } catch(e) {
        next(e);
    }
});

/* PUT /:recipeId
Adds a recipe to the (authenticated) user's menu and the corresponding ingredients to the user's grocery list.
*/
router.put('/:recipeId', isAuthenticated, async (req, res, next) => {
    const userEmail = req.userId;
    const recipeID = req.params.recipeId;
    try {
        const biggerMenu = await userDAO.addRecipe(userEmail, recipeID);
        if (biggerMenu) {
            res.status(200).send(biggerMenu);
        } else {
            res.status(400).send('Could not update menu.');
        }
    } catch(e) {
        next(e);
    }
});

/* DELETE /
Deletes all recipes from the (authenticated) user's menu and all ingredients from user's grocery list.
*/
router.delete('/', isAuthenticated, async (req, res, next) => {
    const userEmail = req.userId;
    try {
        const emptyMenu = await userDAO.clearMenu(userEmail);
        if (emptyMenu) {
            res.sendStatus(200);
        } else {
            res.status(404).send('Could not clear the menu.');
        }
    } catch(e) {
        next(e);
    }
});

/* DELETE /:recipeId
Deletes a recipe from the (authenticated) user's menu and the corresponding ingredients from the user's grocery list.
*/
router.delete('/:recipeId', isAuthenticated, async (req, res, next) => {
    const userEmail = req.userId;
    const recipeID = req.params.recipeId;
    try {
        const smallerMenu = await userDAO.removeRecipe(userEmail, recipeID);
        if (smallerMenu) {
            res.status(200).send(smallerMenu);
        } else {
            res.status(400).send('Could not update menu.');
        }
    } catch(e) {
        next(e);
    }
});


module.exports = router;