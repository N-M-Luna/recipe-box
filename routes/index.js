const { Router } = require("express");
const router = Router();

//Login routes
router.use('/login', require('./login'));

//Recipe routes
router.use('/recipes', require('./recipes'));

//Menu routes
router.use('/menu', require('./menu'));

//Error handling
router.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send(err);
  });
module.exports = router;