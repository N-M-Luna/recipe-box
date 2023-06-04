const request = require('supertest');
const server = require('../server');
const testUtils = require('../test-utils');
const User = require('../models/user');
const Ingredient = require('../models/ingredient');
const Recipe = require('../models/recipe');

describe('/recipes', () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);
  afterEach(testUtils.clearDB);

  //Testing docs
  const { freeUser, adminUser } = require('./login.test');
  const testIngredients = [
    {
      name: 'dehydrated pizza',
      plural: 'dehydrated pizzas',
    },
    {
      name: 'egg',
      plural: 'eggs'
    },
    {
      name: 'mirin',
    },
    {
      name: 'rice',
    },
    {
      name: 'nori',
    },
    {
      name: 'beans'
    },
    {
      name: 'sofrito',
    },
    {
      name: 'tomato paste',
    },
  ]
  const dehydratedPizza = {
    title: 'Dehydrated pizza',
    author: freeUser.email,
    ingredients: [ [1, '',  'dehydrated pizza'] ],
    instructions: 'Place in oven. Enjoy the show.',
    prepTime: [0, 0, 3],
    cuisine: 'American'
  }
  const tamagoyaki = {
    title: 'Egg sushi',
    author: adminUser.email,
    ingredients: [ [4, '',  'eggs'], [2, 'oz', 'mirin'], [2, 'sheets', 'nori'] [1, 'cup', 'rice'] ],
    instructions: 'Mix the eggs with mirin and cook on pan. Roll eggs into a log and slice. Use nori and culinary voodoo to make cute shapes.',
    prepTime: [0, 0, 45],
    cuisine: 'Japanese'
  }
  const arrozConHabichuelas = {
    title: 'Rice and beans',
    author: freeUser.email,
    ingredients: [ [1, 'cup', 'rice'], [1, 'can', 'beans'], [2, 'tbsp', 'sofrito'], [2, 'tbs', 'tomato paste'] ],
    instructions: 'Mix sofrito, tomato paste and spices in pot. ',
    prepTime: [0, 0, 30],
    cuisine: 'Caribbean'
  }

    describe('POST /', () => {
      //Before each:
      //sign up and log in free user

        it('should return 200 and create a recipe with authenticated user', async () => {
            //create ingredients in DB
            //post a recipe with ingredients in DB
            //expect a 200
            //expect there to be a recipe in the DB
         });

        it('should return 200 and create a new ingredient doc if it does not exist', async () => {
          //post a new recipe
          //expect a 200
          //expect new ingredients to be in DB
        });

        it('it should return 400 with recipe without %keys', async () => {
            //for each key in dehydratedPizza, send the object without that key
            //expect a 400
            //expect the DB to be empty
        });

        it('should return 401 and not create a recipe with unauthenticated user', async () => {
          //post a recipe with a BAD token
          //expect a 401
        });

        it('should return 409 with a repeated recipe', async () => {
          //write dehydratedPizza to the DB
          //post the same recipe
          //expect a 409
        });

    });

    describe('GET /', () => {
      //before all:
      //write three recipes to the DB

        it('should return all the recipes for any user', async () => {
          //get all recipes
          //expect a 200
          //expect response to contain three recipes
        });

        it('should return %recipes with an array of strings as its ingredients', async () => {
          //get all recipes
          //expect a 200
          //for each recipe:
          //expect the ingredients fiels to be an array of strings
        });

    });

    decribe('GET / :userId', () => {
      //Before each:
      //Write all three recipes to the DB

        it('should return all recipes by %users', () => {
          //get recipes by freeUser
          //expect a 200
          //expect recipes in response to be 2
          //get recipes by adminUser
          //expect a 200
          //expect recipes in response to be 1
        });

    });

    decribe('GET / search', () => {
      //Before all
      //Write all three recipes to the DB

        it('should return all recipes that have %ingredients', () => {
          //get recipes with ingredients: ['dehydrated pizza', 'rice']
          //expect first to return 1 recipe, second to return 2.

        });

        it('should return all recipes that have "%keywords"', () => {
          //get recipes with keywords: ['Caribbean', 'sushi', 'oven']
          //For each:
          //expect response to contain 1 recipe
        });

    });

    decribe('PUT / :recipeId', () => {
      //before each:
      //sign up and log in freeUser
      //create recipe by freeUser

        it('should return 200 and update the recipe for the author', () => {
          //put a recipe update
          //expect a 200
          //expect recipe to be updated
        });

        it('should return 400 with an empty body', () => {
          //put a recipe update but send the request with an empty body
          //expect a 400
        });

        it('should return 401 to anyone other than the author', () => {
          //sign up and log in adminUser
          //put a recipe update with admin user
          //expect a 401
        });

    });

    decribe('DELETE /:recipeId', () => {
      //before each:
      //Write all three recipes to the db
      //sign up both users

        it('should return 200 when %users tried to delete their own recipe', () => {
          //For each user:
          //log in user
          //delete recipe by freeUser
          //expect a 200
          //expect there to be 2 recipes in the DB
        });

        it('should return 200 when admin user tries to delete recipe by someone else', () => {
          //log in adminUser
          //delete recipe by freeUser
          //expect a 200
          //expect DB to have 2 recipes
        });

        it('should return 401 when user tries to delete recipe by someone else', () => {
          //login freeUser
          //delete recipe by adminUser
          //expect a 401
          //expect DB to have 3 recipes
        });

    });
});

/*
/recipes

POST /
- it should return 200 and create a recipe with authenticated user
- it should return 200 and create a new ingredient doc if it does not exist
- it should return 400 with recipe without %keys
- it should return 401 and not create a recipe with unauthenticated user
- it should return 409 with a repeated recipe

GET /
- it should return all the recipes for any user
- it should return %recipes with an array of strings as its ingredients

GET /:userId
- it should return all recipes by %users

GET /search
- it should return all recipes that have %ingredients
- it should return all recipes that have "%keywords"

PUT /:recipeId
- it should return 200 and update the recipe for the author
- it should return 400 with an empty body
- it should return 401 to anyone other than the author

DELETE /:recipeId
- it should return 200 when %users tried to delete their own recipe
- it should return 200 when admin user tries to delete someone else's recipe
- it should return 401 when user tries to delete someone else's recipe

-----

400- Bad Request (Data sent by client is incomplete or incorrect)
401- Unauthorized (User is not authenticated)
403- Forbidden (User is not authorized)
409- Conflict (Duplicate data already in server)
500- Internal Server Error (Developers made an oopsie)

*/