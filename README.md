# About **Recipe Box**

Final project for JSCRIPT 330 B <br>
Spring 2023 <br>
University of Washington

## Scenario

?

## Problem it seeks to solve

This app is my solution to meal planning for the week. The user browses recipes and picks the ones they want to make that week. Then, the app puts together the grocery list and menu.

## Technical components

### Models

- User model
  - Email: String(unique) (index)
  - Password: Encrypted string
  - Roles: Array of strings
  - Menu: Array of Recipe _id's
  - Grocery list: Array of Ingredient _id's
- Recipe model
  - Title: String (unique) (index)
  - Author: User email
  - Ingredients: Arrays of [number, Ingredient _id] arrays.
  - Instructions
  - Prep time
  - Cuisine
- Ingredients model
  - Name
  - Plural name

### Routes

#### /login routes

- **/login/signup** - creates a new user.

- **/login/** - reads an existing user.

- **/login/password** - updates a user's password. (Restricted to authenticated users.)

- **/login/delete** - deletes a user. (Restricted to authorized users.)

#### /recipes routes

- **/recipes/add** - creates a new recipe. (Restricted to authenticated users.)

- **/recipes/** - reads all the recipes. Returns recipe objects after swapping the ingredients field (an array of `[int, _id]` arrays) with an array of strings that describe the ingredients and their quantities.

- **/recipes/:userId** - reads all recipes by user with id: userId.

- **/recipes/search** - reads all recipes that match a query (by text search or by ingredient)


- **/recipes/edit** - updates an existing recipe. (Authenticated users can update only their own recipes.)

- **recipes/delete** - deletes a recipe. (Authenticated users can delete their own recipes. Authorized users can delete any recipe.)

#### /menu routes

> All /menu routes require authentication.

- **/menu/** - reads the user's menu.

- **/grocery-list** - reads the user's grocery list

- **/menu/add** - update user's menu to include a recipe and the user's grocery list to include the corresponding ingredients.

- **/menu/clear** - delete all recipes from user's menu and all ingredients from user's grocery list.

## Project requirements

- There are 7 routes that use **authentication** and 2 routes that use **authorization**.

- The /login and the /recipes routes are both complete sets of **CRUD routes**. The /menu routes only have Read and Update route.

- The following fields should be **unique**: name (in ingredients), title (in recipes), and  email (in user).

- The Author field (in the Recipe model) will have an **index**, for use in the /recipes/:userId route. The Ingredients field will also have an index, for use in the /recipes/search route.

- The Title, Instructions, and Cuisine fields (in the Recipe model) will be included in the **text search** for the /recipes/search route.


## Timeline

By May 30, I would like to have finished the /login routes and the corresponding .

By June 6, I would like to have finished the /recipes routes.

By June 13, I would like to have finished the /menu routes.

By June 18, I would like to have finished debugging all my inevitable bugs. If I'm done before then, I would like to use aggregation or lookups in the /recipes/search route; so the app can have filters for the recipes.