const { Router } = require("express");
const router = Router();

//Login routes
router.use('/login', require('./login'));

//Error handling
router.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send(err);
    console.log(err);
  });
module.exports = router;