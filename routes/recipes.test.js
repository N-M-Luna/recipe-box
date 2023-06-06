const request = require('supertest');
const server = require('../server');
const testUtils = require('../test-utils');
const User = require('../models/user');
const Ingredient = require('../models/ingredient');
const Recipe = require('../models/recipe');
const Token = require('../models/token');

describe('/recipes', () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);
  afterEach(testUtils.clearDB);

  //Testing docs
  const freeUser = {
    email: 'checkov@starfleet.org',
    password: 'iH3artIrina',
  };
  const adminUser = {
    email: 'demosthenes@ColMin.gov',
    password: 'p3t3rSux',
  };
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
      name: 'tomato paste'
    }
  ]
  const dehydratedPizza = {
    title: 'Dehydrated pizza',
    ingredients: [[1, '', 'dehydrated pizza']],
    instructions: 'Place in oven. Enjoy the show.',
    prepTime: [0, 0, 3],
    cuisine: 'American'
  }
  const tamagoyaki = {
    title: 'Egg sushi',
    ingredients: [[4, '', 'egg'], [2, 'oz', 'mirin'], [2, 'sheets', 'nori'], [1, 'cup', 'rice']],
    instructions: 'Mix the eggs with mirin and cook on pan. Roll eggs into a log and slice. Use nori and culinary voodoo to make cute shapes.',
    prepTime: [0, 0, 45],
    cuisine: 'Japanese'
  }
  const arrozConHabichuelas = {
    title: 'Rice and beans',
    ingredients: [[1, 'cup', 'rice'], [1, 'can', 'beans'], [2, 'tbsp', 'sofrito']],
    instructions: 'Mix sofrito, tomato paste and spices in pot. Stir in rice. Add water and bring to boil. Simmer for 15 minutes.',
    prepTime: [0, 0, 30],
    cuisine: 'Caribbean'
  }
  const dehydratedPizzaString = {
    ...dehydratedPizza,
    ingredients: ['1 dehydrated pizza']
  }
  const tamagoyakiString = {
    ...tamagoyaki,
    ingredients: ['4 egg', '2 oz mirin', '2 sheets nori', '1 cup rice'],
  }
  const arrozConHabichuelasString = {
    ...arrozConHabichuelas,
    ingredients: ['1 cup rice', '1 can beans', '2 tbsp sofrito'],
  }

  //Start Testing
  describe('POST /', () => {
    //Before each:
    //sign up and log in free user
    let userLoginResponse, userToken, adminLoginResponse, adminToken
    beforeEach(async () => {

      await request(server).post('/login/signup').send(freeUser);
      userLoginResponse = await request(server).post('/login').send(freeUser);
      userToken = userLoginResponse.body.token;

      await request(server).post('/login/signup').send(adminUser);
      adminLoginResponse = await request(server).post('/login').send(adminUser);
      adminToken = adminLoginResponse.body.token;
      await User.updateOne({ email: adminUser.email }, { $push: { roles: 'admin' } });
    });
    afterEach(testUtils.clearDB);

    it('should return 200 and create a recipe with authenticated user', async () => {

      //create ingredients in DB
      await Ingredient.create(testIngredients);

      //post a new recipe with ingredients in DB
      const response = await request(server)
        .post('/recipes')
        .set('Authorization', 'Bearer ' + userToken)
        .send(dehydratedPizza);

      //expect a 200
      expect(response.statusCode).toEqual(200);

      //expect there to be a recipe in the DB
      const recipesInDB = await Recipe.find().lean();
      expect(recipesInDB.length).toEqual(1);
    });

    it('should return 200 and create a new ingredient doc if it does not exist', async () => {
      //post a new recipe
      const response = await request(server)
        .post('/recipes')
        .set('Authorization', 'Bearer ' + adminToken)
        .send(tamagoyaki);

      //expect a 200
      expect(response.statusCode).toEqual(200);

      //expect new ingredients to be in DB
      const ingredientsInDB = await Ingredient.find().lean();
      expect(ingredientsInDB.length).toBeGreaterThan(0);
    });

    it.each(Object.keys(arrozConHabichuelas))('should return 400 with recipe without %s field', async (key) => {
      //for each key in arrozConHabichuelas, send the object without that key
      const incompleteRecipe = {
        ...arrozConHabichuelas,
        [key]: null
      };
      const response = await request(server)
        .post('/recipes')
        .set('Authorization', 'Bearer ' + userToken)
        .send(incompleteRecipe);

      //expect a 400
      expect(response.statusCode).toEqual(400);

      //expect the DB to be empty
      const recipesInDB = await Recipe.find().lean();
      expect(recipesInDB.length).toEqual(0);
    });

    it('should return 401 and not create a recipe with unauthenticated user', async () => {
      //post a recipe with a BAD token
      const response = await request(server)
        .post('/recipes')
        .set('Authorization', 'Bearer BAD')
        .send(dehydratedPizza);

      //expect a 401
      expect(response.statusCode).toEqual(401);
    });

    it('should return 409 with a repeated recipe', async () => {
      //write tamagoyaki to the DB
      await Recipe.create({
        ...tamagoyaki,
        author: adminUser.email
      });

      //post the same recipe
      const response = await request(server)
        .post('/recipes')
        .set('Authorization', 'Bearer ' + userToken)
        .send(tamagoyaki);

      //expect a 409
      expect(response.statusCode).toEqual(409);
    });

  });

  describe('GET /', () => {
    //before all:
    //write three recipes to the DB
    beforeEach(async () => {
      await request(server).post('/login/signup').send(freeUser);
      const userLoginResponse = await request(server).post('/login').send(freeUser);
      const userToken = userLoginResponse.body.token;

      await request(server)
        .post('/recipes')
        .set('Authorization', 'Bearer ' + userToken)
        .send(dehydratedPizza);

      await request(server)
        .post('/recipes')
        .set('Authorization', 'Bearer ' + userToken)
        .send(tamagoyaki);

      await request(server)
        .post('/recipes')
        .set('Authorization', 'Bearer ' + userToken)
        .send(arrozConHabichuelas);

    });
    afterEach(testUtils.clearDB);

    it('should return all the recipes for any user', async () => {
      //get all recipes
      const response = await request(server).get('/recipes');

      //expect a 200
      expect(response.statusCode).toEqual(200);

      //expect response to contain three recipes (with author and with ingredient strings, not arrays)
      const fullDehydratedPizza = {
        ...dehydratedPizzaString,
        author: freeUser.email
      }
      const fullTamagoyaki = {
        ...tamagoyakiString,
        author: freeUser.email,
      }
      const fullArrozConHabichuelas = {
        ...arrozConHabichuelasString,
        author: freeUser.email,
      }
      expect(response.body).toMatchObject([ fullDehydratedPizza, fullTamagoyaki, fullArrozConHabichuelas])
    });

    it('should return recipes with strings as ingredients', async () => {
      //get all recipes
      const response = await request(server).get('/recipes');

      //expect a 200
      expect(response.statusCode).toEqual(200);

      //expect the ingredients fiels to be an array of strings
      const recipesInResponse = response.body;
      const randomIngredient = recipesInResponse[0].ingredients[0];
      expect(typeof randomIngredient).toEqual('string');
    });

  });

  describe('GET / search', () => {
    //Before all
    //Write all three recipes to the DB
    beforeEach(async () => {

      await request(server).post('/login/signup').send(freeUser);
      const userLoginResponse = await request(server).post('/login').send(freeUser);
      const userToken = userLoginResponse.body.token;
      await request(server).post('/login/signup').send(adminUser);
      const adminLoginResponse = await request(server).post('/login').send(adminUser);
      const adminToken = adminLoginResponse.body.token;

      await request(server)
        .post('/recipes')
        .set('Authorization', 'Bearer ' + userToken)
        .send(dehydratedPizza);

      await request(server)
        .post('/recipes')
        .set('Authorization', 'Bearer ' + userToken)
        .send(tamagoyaki);

      await request(server)
        .post('/recipes')
        .set('Authorization', 'Bearer ' + adminToken)
        .send(arrozConHabichuelas);
    });
    afterEach(testUtils.clearDB);

    it('should return all recipes that have queried ingredient', async () => {
      //get recipes with ingredients: 'dehydrated pizza', 'rice'
      //expect first to return 1 recipe, second to return 2.
      let response = await request(server).get('/recipes/search?ingredient=' + encodeURI('dehydrated pizza'));
      expect(response.statusCode).toEqual(200);
      expect(response.body.length).toEqual(1);

      response = await request(server).get('/recipes/search?ingredient=' + encodeURI('rice'));
      expect(response.statusCode).toEqual(200);
      expect(response.body.length).toEqual(2);
    });

    it.each(['Caribbean', 'sushi', 'oven'])('should find recipes that have "%s"', async (searchTerm) => {
      //get recipes with keywords: ['Caribbean', 'sushi', 'oven']
      //For each:
      //expect response to contain 1 recipe
      const response = await request(server).get("/books/search?query=" + encodeURI(searchTerm));
      expect(response.statusCode).toEqual(200);
      expect(response.body.length).toEqual(1);
    });

  });

  describe('GET / :userId', () => {
    //Before each:
    //Write all three recipes to the DB
    beforeEach(async () => {

      await request(server).post('/login/signup').send(freeUser);
      const userLoginResponse = await request(server).post('/login').send(freeUser);
      const userToken = userLoginResponse.body.token;
      await request(server).post('/login/signup').send(adminUser);
      const adminLoginResponse = await request(server).post('/login').send(adminUser);
      const adminToken = adminLoginResponse.body.token;

      await request(server)
        .post('/recipes')
        .set('Authorization', 'Bearer ' + userToken)
        .send(dehydratedPizza);

      await request(server)
        .post('/recipes')
        .set('Authorization', 'Bearer ' + userToken)
        .send(tamagoyaki);

      await request(server)
        .post('/recipes')
        .set('Authorization', 'Bearer ' + adminToken)
        .send(arrozConHabichuelas);
    });
    afterEach(testUtils.clearDB);

    it('should return recipes by userIds', async () => {
      //get recipes by freeUser
      let response = await request(server).get(`/recipes/${freeUser.email}`);

      //expect a 200
      expect(response.statusCode).toEqual(200);
      //expect recipes in response to be 2
      expect(response.body.length).toEqual(2)

      //get recipes by adminUser
      response = await request(server).get(`/recipes/${adminUser.email}`);

      //expect a 200
      expect(response.statusCode).toEqual(200);
      //expect recipes in response to be 1
      expect(response.body.length).toEqual(1)
    });

  });

  describe('PUT / :recipeId', () => {
    //before each:
    //sign up and log in freeUser
    //create recipe by freeUser
    let userLoginResponse, userToken, pizzaRecipeId
    beforeEach(async () => {
      await request(server).post('/login/signup').send(freeUser);
      userLoginResponse = await request(server).post('/login').send(freeUser);
      userToken = userLoginResponse.body.token;

      const res = await request(server)
        .post('/recipes')
        .set('Authorization', 'Bearer ' + userToken)
        .send(dehydratedPizza);

      pizzaRecipeId = res.body._id;
      });
      afterEach(testUtils.clearDB);

    it('should return 200 and update the recipe for the author', async () => {
      //put a recipe update
      const response = await request(server)
        .put(`/recipe/${pizzaRecipeId}`)
        .set('Authorization', 'Bearer ' + userToken)
        .send({prepTime: [0, 0, 1]});

      //expect a 200
      expect(response.statusCode).toEqual(200);
      //expect recipe to be updated
    });

    it('should return 400 with an empty body', async () => {
      //put a recipe update but send the request with an empty body
      const response = await request(server)
        .put(`/recipe/${pizzaRecipeId}`)
        .set('Authorization', 'Bearer ' + userToken)
        .send({});

      //expect a 400
      expect(response.statusCode).toEqual(400);
    });

    it('should return 401 to anyone other than the author', async () => {
      //sign up and log in adminUser
      await request(server).post('/login/signup').send(adminUser);
      const adminLoginResponse = await request(server).post('/login').send(adminUser);
      const adminToken = adminLoginResponse.body.token;
      await User.updateOne({ email: adminUser.email }, { $push: { roles: 'admin' } });

      //put a recipe update with admin user
      const response = await request(server)
        .put(`/recipes/${pizzaRecipeId}`)
        .set(`Authorization`, 'Bearer ' + adminToken)
        .send({prepTime: [0, 0, 1]});

      //expect a 403
      expect(response.statusCode).toEqual(403);
    });

  });

  describe('DELETE /:recipeId', () => {
    //before each:
    //Write two recipes to the db
    //sign up both users
    let pizzaRecipeId, tamagoyakiRecipeId, userLoginResponse, userToken, adminLoginResponse, adminToken
    beforeEach(async () => {

      await request(server).post('/login/signup').send(freeUser);
      userLoginResponse = await request(server).post('/login').send(freeUser);
      userToken = userLoginResponse.body.token;

      await request(server).post('/login/signup').send(adminUser);
      adminLoginResponse = await request(server).post('/login').send(adminUser);
      adminToken = adminLoginResponse.body.token;
      await User.updateOne({ email: adminUser.email }, { $push: { roles: 'admin' } });

      const pizzaRes = await request(server)
        .post('/recipes')
        .set('Authorization', 'Bearer ' + userToken)
        .send(dehydratedPizza);

      pizzaRecipeId = pizzaRes.body._id;

      const eggRes = await request(server)
        .post('/recipes')
        .set('Authorization', 'Bearer ' + userToken)
        .send(dehydratedPizza);

        tamagoyakiRecipeId = eggRes.body._id;
    });
    afterEach(testUtils.clearDB);

    it('should return 200 when %users tried to delete their own recipe', async () => {
      //freeUser requests to delete recipe by freeUser
      const response = await request(server)
        .delete(`/recipes/${pizzaRecipeId}`)
        .set('Authorization', 'Bearer ' + userToken);

      //expect a 200
      expect(response.statusCode).toEqual(200);

      //expect there to be 1 recipe in the DB
      const recipesInDB = await Recipe.find().lean();
      expect(recipesInDB.length).toEqual(1);
    });

    it('should return 200 when admin user tries to delete recipe by someone else', async () => {
      //adminUser requests to delete recipe by freeUser
      const response = await request(server)
        .delete(`/recipes/${pizzaRecipeId}`)
        .set('Authorization', 'Bearer ' + adminToken);

      //expect a 200
      expect(response.statusCode).toEqual(200);

      //expect there to be 1 recipe in the DB
      const recipesInDB = await Recipe.find().lean();
      expect(recipesInDB.length).toEqual(1);
    });

    it('should return 403 when user tries to delete recipe by someone else', async () => {
      //freeUser requests to delete recipe by adminUser
      const response = await request(server)
        .delete(`/recipes/${tamagoyakiRecipeId}`)
        .set('Authorization', 'Bearer ' + userToken);

      //expect a 403
      expect(response.statusCode).toEqual(403);

      //expect DB to have 2 recipes
      const recipesInDB = await Recipe.find().lean();
      expect(recipesInDB.length).toEqual(2);
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
- it should return 403 to anyone other than the author

DELETE /:recipeId
- it should return 200 when %users tried to delete their own recipe
- it should return 200 when admin user tries to delete someone else's recipe
- it should return 403 when user tries to delete someone else's recipe

-----

400- Bad Request (Data sent by client is incomplete or incorrect)
401- Unauthorized (User is not authenticated)
403- Forbidden (User is not authorized)
409- Conflict (Duplicate data already in server)
500- Internal Server Error (Developers made an oopsie)

*/