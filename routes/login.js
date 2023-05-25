const { Router } = require('express');
const router = Router();
const bcrypt = require('bcrypt');
const {isAuthenticated} = require('./middleware');
const userDAO = require('../daos/user');
const tokenDAO = require('../daos/token');

/* POST /signup
Uses bcrypt on the incoming password.
Stores user with their email and encrypted password; handles conflicts when the email is already in use.
*/
router.post('/signup', async (req, res, next) => {
    //Grab incoming email and password.
    const {email, password} = req.body;
    const actuallyOldUser = await userDAO.getUser(email);

    //Check that the password is not missing or empty. If so, return error 400.
    if (!password || password==undefined || password=='') {
        res.status(400).send('Password is required.');

    //Check that the email is not in use. If so, return error 409 'Conflict with a repeat signup'.
    } else if (actuallyOldUser) {
        res.status(409).send('Conflict with a repeat signup');

    //If both checks pass, encrypt the password.
    } else {
        const saltRounds = 10;

        //Hash the input text password
        bcrypt.hash(password, saltRounds).then(async function(hash) {
            const savedNewUser = await userDAO.createUser({ email: email, password: hash });
            if (savedNewUser) {
                res.sendStatus(200);
            } else {
                res.sendStatus(400);
            }
        });
    }
});

/* POST /
Finds the user with the provided email.
Uses bcrypt to compare stored password with the incoming password.
If there's a match, generates a random token with uuid and returns it to the user.
*/
router.post('/', async (req, res, next) => {
    //Find the user with the email that the user input
    const inputEmail = req.body.email;
    const user = await userDAO.getUser(inputEmail);

    //Grab the password (in plain text) that the user input
    const inputPassword = req.body.password;

    //Check that there exists a user with that email
    if (!user) {
        res.status(401).send('Email is not associated with any user.');

    //Check that the user input a password
    } else if (!inputPassword || inputPassword === '') {
        res.status(400).send(`Password is missing.`);

    //Check that user.password matches hashed inputPassword
    } else {
        const match = await bcrypt.compare(inputPassword, user.password);

        //If so, generate a random token with uuid and return it to the user.
        if (!match) {
            res.status(401).send('Password is incorrect.');

        //If not, send a 401 code.
        } else {
            const token = await tokenDAO.makeTokenForUserId(user.email);
            req.headers.authorization = token;
            res.status(200).send({token});
        }
    }
});

/* POST /password
If the user is logged in, stores the incoming password using their userId.
*/
router.post('/password', isAuthenticated, async (req, res, next) => {
    //Check that the password exists
    const newPassword = req.body.password;

    if (!newPassword || newPassword=='') {
        res.status(400).send('New password is required.')
    } else {
        //Encrypt the password.
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(newPassword, salt, async function (err, hash) {
                try {
                    //Update the user+password doc in Users and return 200 code.
                    const userWithNewPass = await userDAO.updateUserPassword(req.body.email, hash)
                    if (userWithNewPass) {
                        res.sendStatus(200);
                    } else {
                        res.sendStatus(400);
                    }
                } catch (err) {
                    res.status(500).send(err.message);
                }
            });
        });
    }
});

/* POST /logout
If the user is logged in, invalidate their token so they can't use it again (remove it).
*/
router.post('/logout', async (req, res, next) => {
    const oldToken = req.headers.authorization;
    const removedToken = tokenDAO.removeToken(oldToken);
    if (removedToken) {
        res.status(200).send(removedToken);
    } else {
        res.sendStatus(400);
    }
});


module.exports = router;