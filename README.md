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

- GET **/recipes/search** - reads all recipes that match a query (by text search or by ingredient)

- PUT **/recipes/:recipeId** - updates an existing recipe. (Authenticated users can update only their own recipes.)

- DELETE **recipes/:recipeId** - deletes a recipe. (Authenticated users can delete their own recipes. Authorized users can delete any recipe.)

#### /menu routes

> All /menu routes require authentication.

- GET **/menu/** - reads the user's menu.

- GET **/grocery-list** - reads the user's grocery list

- PUT **/menu/** - update user's menu to include a recipe and the user's grocery list to include the corresponding ingredients.

- DELETE **/menu/** - delete all recipes from user's menu and all ingredients from user's grocery list.

## Project requirements

- There are 7 routes that use **authentication** and 2 routes that use **authorization**.

- The /login and the /recipes routes are both complete sets of **CRUD routes**. The /menu routes only have Read, Update, and Delete routes.

- The following fields should be **unique**: name (in ingredients), title (in recipes), and  email (in user).

- The Author field (in the Recipe model) will have an **index**, for use in the /recipes/:userId route. The Ingredients field will also have an index, for use in the /recipes/search route.

- The Title, Instructions, and Cuisine fields (in the Recipe model) will be included in the **text search** for the /recipes/search route.


## Timeline

By May 30, I would like to have finished the /login routes and its corresponding models and dao methods.

By June 6, I would like to have finished the /recipes routes and its corresponding models and dao methods.

By June 13, I would like to have finished the /menu routes and its corresponding dao methods.

By June 18, I would like to have finished debugging all my inevitable bugs. If I'm done before then, I would like to use aggregation or lookups in the /recipes/search route; so the app can have filters for the recipes.