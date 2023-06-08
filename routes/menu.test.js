/*
/menu

GET /
- it should return 200 and the menu with an authenticated user
- it should return 401 with a non-authenticated user

GET /grocery-list
- it should return 200 and the grocery list with an authenticated user
- it should return 401 with a non-authenticated user

PUT /:recipeId
- it should return 200 with a valid recipeId and authenticated user
- it should update the menu and grocery list
- it should return 400 with an invalid recipeId
- it should return 401 with a non-authenticated user

DELETE /
- it should return 200 with a valid recipeId and authenticated user
- it should delete everything with a valid recipeId and authenticated user
- it should return 401 with a non-authenticated user

DELETE /:recipeId
- it should return 200 with a valid recipeId and authenticated user
- it should update the menu and grocery list
- it should return 400 with an invalid recipeId
- it should return 401 with a non-authenticated user

400- Bad Request (Data sent by client is incomplete or incorrect)
401- Unauthorized (User is not authenticated)
403- Forbidden (User is not authorized)
409- Conflict (Duplicate data already in server)
500- Internal Server Error (Developers made an oopsie)

*/