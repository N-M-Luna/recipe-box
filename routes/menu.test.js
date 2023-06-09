const request = require('supertest');

const server = require('../server');
const testUtils = require('../test-utils');

const User = require('../models/user');

describe('/menu', () => {
    beforeAll(testUtils.connectDB);
    afterAll(testUtils.stopDB);
    afterEach(testUtils.clearDB);

    //Test docs
    const freeUser = {
        email: 'checkov@starfleet.org',
        password: 'iH3artIrina',
    };
    const adminUser = {
        email: 'demosthenes@ColMin.gov',
        password: 'p3t3rSux',
    };
    const dehydratedPizza = {
        title: 'Dehydrated pizza',
        ingredients: [[1, '', 'dehydrated pizza']],
        instructions: 'Place in oven. Enjoy the show.',
        prepTime: [0, 0, 3],
        cuisine: 'American'
    };
    const arrozConHabichuelas = {
        title: 'Rice and beans',
        ingredients: [[1, 'cup', 'rice'], [1, 'can', 'beans'], [2, 'tbsp', 'sofrito']],
        instructions: 'Mix sofrito, tomato paste and spices in pot. Stir in rice. Add water and bring to boil. Simmer for 15 minutes.',
        prepTime: [0, 0, 30],
        cuisine: 'Caribbean'
    };
    const [dehydratedPizzaString, arrozConHabichuelasString] = [dehydratedPizza, arrozConHabichuelas].map(recipeObj => ({
            ...recipeObj,
            ingredients: recipeObj.ingredients.map(ingr => `${ingr[0].toString} ${ingr[1].length > 0 ? `${ingr[0]} ` : ``}${ingr[2]}`)
        }));

    describe('before login', () => {
        describe('GET /', () => {
            it('should return 401', async () => {
                const response = await request(server).get('/menu');
                expect(response.statusCode).toEqual(401);
            });
        });
        describe('GET / grocery-list', () => {
            it('should return 401', async () => {
                const response = await request(server).get('/menu/grocery-list');
                expect(response.statusCode).toEqual(401);
            });
        });
        describe('DELETE /', () => {
            it('should return 401', async () => {
                const response = await request(server).put(`/menu`);
                expect(response.statusCode).toEqual(401);
            });
        });
    });

    describe('after login', () => {

        let userLoginResponse, userToken, adminLoginResponse, adminToken
        let pizzaRecipeID, dehydratedPizzaID, riceID, beansID, sofritoID, arrozConHabichuelasID
        beforeEach(async () => {

            await request(server).post('/login/signup').send(freeUser);
            userLoginResponse = await request(server).post('/login').send(freeUser);
            userToken = userLoginResponse.body.token;

            const pizzaResponse = await request(server)
                .post('/recipes')
                .set('Authorization', 'Bearer ' + userToken)
                .send(dehydratedPizza);
            pizzaRecipeID = pizzaResponse.body._id;
            dehydratedPizzaID = pizzaResponse.body.ingredients[0][2];

            await request(server).post('/login/signup').send(adminUser);
            adminLoginResponse = await request(server).post('/login').send(adminUser);
            adminToken = adminLoginResponse.body.token;
            await User.updateOne({ email: adminUser.email }, { $push: { roles: 'admin'} });

            const arrozResponse = await request(server)
                .post('/recipes')
                .set('Authorization', 'Bearer ' + userToken)
                .send(dehydratedPizza);
            arrozConHabichuelasID = arrozResponse.body._id;
            riceID = arrozResponse.body.ingredients[0][2];
            beansID = arrozResponse.body.ingredients[1][2];
            sofritoID = arrozResponse.body.ingredients[2][2];
        })
        afterEach(testUtils.clearDB);

        describe('GET /', () => {
            it('should return 200 and the menu', async () => {
                const putMenuResponse = await request(server)
                    .put(`/menu/${dehydratedPizzaID}`)
                    .set('Authorization', 'Bearer ' + userToken)
                    .send();
                expect(putMenuResponse.statusCode).toEqual(200);

                const getMenuResponse = await request(server)
                    .get('/menu')
                    .set('Authorization', 'Bearer ' + userToken)
                    .send();
                expect(getMenuResponse.statusCode).toEqual(200);
                expect(getMenuResponse.body).toMatchObject({
                    ...dehydratedPizzaString,
                    author: freeUser.email
                });
            });
        });

        describe('GET / grocery-list', () => {
            it('should return 200 and the grocery list', async () => {
                const putMenuResponse = await request(server)
                    .put(`/menu/${arrozConHabichuelasID}`)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();
                expect(putMenuResponse.statusCode).toEqual(200);

                const getListResponse = await request(server)
                    .get('/menu/grocery-list')
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();
                expect(getListResponse.statusCode).toEqual(200);
                expect(getListResponse.body).toMatchObject(arrozConHabichuelasString.ingredients);
            });
        });

        describe('PUT / :recipeId', () => {
            it('should return 200 and update the menu with a valid recipeId', async () => {
                const response = await request(server)
                    .put(`/menu/${pizzaRecipeID}`)
                    .set('Authorization', 'Bearer ' + userToken)
                    .send();
                expect(response.statusCode).toEqual(200);
                const user = await User.findOne({email: freeUser.email}).lean();
                expect(user.menu).toContain(pizzaRecipeID);
            });
            it('should return 200 and update the grocery list with a valid recipeId', async () => {
                const response = await request(server)
                    .put(`/menu/${arrozConHabichuelasID}`)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();
                expect(response.statusCode).toEqual(200);
                const adminUser = await User.findOne({email: adminUser.email}).lean();
                expect(adminUser.groceryList).toContain(arrozConHabichuelas.ingredients[1]);
            });
            it('should return 400 with an invalid recipeId', async () => {
                const response = await request(server)
                    .put(`/menu/invalid-recipe-id`)
                    .set('Authorization', 'Bearer ' + userToken)
                    .send();
                expect(response.statusCode).toEqual(400);
            });
        });

        describe('DELETE /', () => {
            it('should return 200 and delete menu and grocery list', async () => {
                const response = await request(server)
                    .delete('/menu')
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();
                expect(response.statusCode).toEqual(200);
                const adminUser = await User.findOne({email: adminUser.email}).lean();
                expect(adminUser.menu).toBe([]);
                expect(adminUser.groceryList).toBe([]);
            });
        });

        describe('DELETE / :recipeId', () => {
            it('it should return 200 and update the menu', async () => {
                const response = await request(server)
                    .delete(`/menu/${pizzaRecipeID}`)
                    .set('Authorization', 'Bearer ' + userToken)
                    .send();
                expect(response.statusCode).toEqual(200);

                const user = await User.findOne({email: freeUser.email}).lean();
                expect(user.menu).not.toContain(pizzaRecipeID);
            });
            it('it should return 200 and update the grocery list', async () => {
                const response = await request(server)
                    .put(`/menu/${arrozConHabichuelasID}`)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();
                expect(response.statusCode).toEqual(200);
                const adminUser = await User.findOne({email: adminUser.email}).lean();
                expect(adminUser.groceryList).not.toContain(arrozConHabichuelas.ingredients[1]);
            });
            it('should return 400 with an invalid recipeId', async () => {
                const response = await request(server)
                    .put(`/menu/invalid-recipe-id`)
                    .set('Authorization', 'Bearer ' + userToken)
                    .send();
                expect(response.statusCode).toEqual(400);
            });
        });
    });
});

/*
/menu

GET /
- it should return 200 and the menu with an authenticated user
- it should return 401 with a non-authenticated user

GET /grocery-list
- it should return 200 and the grocery list with an authenticated user
- it should return 401 with a non-authenticated user

PUT /:recipeId
- it should return 200 and update the menu
- it should return 200 and update the grocery list
- it should return 400 with an invalid recipeId

DELETE /
- it should return 200 and delete everything with an authenticated user
- it should return 401 with a non-authenticated user

DELETE /:recipeId
- it should return 200 and update the menu
- it should return 200 and update the grocery list
- it should return 400 with an invalid recipeId

400- Bad Request (Data sent by client is incomplete or incorrect)
401- Unauthorized (User is not authenticated)
403- Forbidden (User is not authorized)
409- Conflict (Duplicate data already in server)
500- Internal Server Error (Developers made an oopsie)

*/