# About **Recipe Box**

Final project for JSCRIPT 330 B <br>
Spring 2023 <br>
University of Washington

## Scenario

The user browses recipes and picks the ones they want to make that week. Then, the app puts together the grocery list and menu.

Users can also create, save, and share their own recipes.

## Problem it seeks to solve

This app is my solution to meal planning for the week.

## Technical components

### Models

- User model
  - **Email**: String(unique) (index)
  - **Password**: Encrypted string
  - **Roles**: Array of strings
  - **Menu**: Array of Recipe _id's
  - **Grocery list**: Array of [number, units, Ingredient _id] arrays

- Token model
  - **token**: String (unique) (index)
  - **userId**: String

- Recipe model
  - **Title**: String (unique) (index)
  - **Author**: User email
  - **Ingredients**: Arrays of [number, units, Ingredient _id] arrays.
  - **Instructions**: String
  - **Prep time**: Array of three integers representing days, hours, and minutes
  - **Cuisine**: String

- Ingredients model
  - **Name**: String
  - **Plural name**: String

### Routes

#### /login routes

- POST **/login/signup** - creates a new user.

- POST **/login/logout** - logs out a user (removes token).

- GET **/login/** - reads an existing user.

- PUT **/login/password** - updates a user's password. (Restricted to authenticated users.)

- DELETE **/login/:userId** - deletes a user. (Restricted to authorized users.)

#### /recipes routes

- POST **/recipes/** - creates a new recipe. (Restricted to authenticated users.)

- GET **/recipes/** - reads all the recipes. Returns recipe objects after swapping the ingredients field (an array of `[int, string, _id]` arrays) with an array of strings that describe the ingredients and their quantities.

- GET **/recipes/:userId** - reads all recipes by user with id: userId.

- GET **/recipes/search** - reads all recipes that match a query (by text search)

- PUT **/recipes/:recipeId** - updates an existing recipe. (Authenticated users can update only their own recipes.)

- DELETE **recipes/:recipeId** - deletes a recipe. (Authenticated users can delete their own recipes. Authorized users can delete any recipe.)

#### /menu routes

> All /menu routes require authentication.

- GET **/menu/** - reads the user's menu.

- GET **/grocery-list** - reads the user's grocery list

- PUT **/menu/:recipeId** - update user's menu to include a recipe and the user's grocery list to include the corresponding ingredients.

- DELETE **/menu/** - delete all recipes from user's menu and all ingredients from user's grocery list.

- DELETE **/menu/:recipeId** - delete a recipe from user's menu and corresponding ingredients from user's grocery list.

## Project requirements

- There are 7 routes that use **authentication** and 2 routes that use **authorization**.

- The /login and the /recipes routes are both complete sets of **CRUD routes**. The /menu routes only have Read, Update, and Delete routes.

- The following fields should be **unique**: name (in ingredients), title (in recipes), and  email (in user).

- The Author field (in the Recipe model) has an **index**, for use in the /recipes/:userId route. (The Ingredients field will also have an index, for use in the /recipes/search route.)

- The Title, Instructions, and Cuisine fields (in the Recipe model) are included in the **text search** for the /recipes/search route.

Use these jest flags to see test coverage:` --coverage --coverageDirectory='coverage' `

## Timeline

By May 30, I would like to have finished the /login routes and its corresponding models and dao methods.

By June 6, I would like to have finished the /recipes routes and its corresponding models and dao methods.

By June 13, I would like to have finished the /menu routes and its corresponding dao methods.

By June 18, I would like to have finished debugging all my inevitable bugs. If I'm done before then, I would like to use aggregation or lookups in the /recipes/search route; so the app can have filters for the recipes.

### June 4 Update

**DONE.** Set up Express server.

**DONE.** Write /login tests, routes, and corresponding daos and models.

**WIP.**  Write /recipe tests.

**TODO.** Write /recipe routes and corresponding daos and models.

**TODO.** Write /menu tests, routes, and corresponding daos and models.

**TODO.** Fix 2 failing /login tests.

### June 11 Update

**DONE.** Set up Express server.

**DONE.** Write /login tests, routes, and corresponding daos and models.

**DONE.**  Write /recipe tests, routes and corresponding daos and models.

**DONE.**  Write /menu tests, routes, and corresponding daos and models. (Some DAO methods can and *should* be improved.)

**TODO.** Fix 2 failing /login tests.

### June 16 Update

**DONE.** Set up Express server.

**DONE.** Write /login tests, routes, and corresponding daos and models.

**DONE.**  Write /recipe tests, routes and corresponding daos and models.

**DONE.**  Write /menu tests, routes, and corresponding daos and models. (Some DAO methods can and *should* be improved.)

**DONE.** Fix 2 failing /login tests.

## Self-evaluation

### My approach

My general approach to this project was based on the instructions/recommendations:

- Brainstorm what the app will do.
- Sketch a front end -> Determines what routes to build
- Sketch out what the objects in the DB will look like -> Write tests ->  Write routes -> Write DAO methods

### What I learned

Everything back-end is new to me. So everything I did for this project, I learned in this course. The topics I thought were cool to learn were: basic authentication and authorization, server set-up, aggregation, testing and TDD.

It was tricky to determine the "shape" of the documents in the DB before writing anything else. And it was frustrating to find I might need to or should change how I'm storing recipes in the DB; in particular the ingredients field. This change means having to re-write a lot of DAO methods, routes, and tests.

I think that, as I gain more experience with databases, I will have a better idea of what the documents should look like.

### My results

This is the first piece of code I write for the back-end. The tests made it very clear what I needed to do throughout the project. And I would like to take this approach again for future personal projects.

There are already things I know can do better and which I listed in the [Future features/Bugs](#future-featuresbugs) section.

## Future features/Bugs

- Use aggregation in the user DAO methods.
- Make use of plural names of ingredients.
- Make the grocery list display each ingredient only once. (Needs good unit conversions.)
- Add recipe DAO methods to search by ingredients and by other fields.
- Add admin routes.
- Add a "/recipes/full/:recipeId" route.
- Build a front-end!!