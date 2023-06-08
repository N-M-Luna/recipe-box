const { Router } = require('express');
const router = Router();
const {isAuthenticated} = require('./middleware');
const userDAO = require('../daos/user');

/* GET /
Gets the (authenticated) user's menu.
*/
router.get('/', isAuthenticated, async (req, res, next) => {});

/* GET /grocery-list
Gets the (authenticated) user's grocery list.
*/
router.get('/grocery-list', isAuthenticated, async (req, res, next) => {});

/* PUT /:recipeId
Adds a recipe to the (authenticated) user's menu and the corresponding ingredients to the user's grocery list.
*/
router.put('/:recipeId', isAuthenticated, async (req, res, next) => {});

/* DELETE /
Deletes all recipes from the (authenticated) user's menu and all ingredients from user's grocery list.
*/
router.put('/', isAuthenticated, async (req, res, next) => {});

/* DELETE /:recipeId
Deletes a recipe from the (authenticated) user's menu and the corresponding ingredients from the user's grocery list.
*/
router.put('/:recipeId', isAuthenticated, async (req, res, next) => {});


module.exports = router;