const tokenDAO = require('../daos/token');

async function isAuthenticated (req, res, next) {

    try {
    //Grab the token from the header and the userId from the token.
    let headerToken, tokenUserId;
    const authHeader = req.headers.authorization

    //Check that there is an authorization header
    if (!authHeader) {
        res.status(401).send('Missing token.');

    } else {
        //Grab the token string
        headerToken = authHeader.slice(7);

        //Check if token is bad.
        if (headerToken=="BAD") {
            res.status(401).send("Bad token.");
        } else {

            //If token is good, grab the email associated with that
            tokenUserId = await tokenDAO.getUserIdFromToken(headerToken);

            //And check that there is a userID associated with it.
            if (!tokenUserId) {
                res.status(401).send("User not logged in.");
            } else {
                next();
            }
        }
    }
    } catch(e) {
        next(e);
    }
}

module.exports = { isAuthenticated }