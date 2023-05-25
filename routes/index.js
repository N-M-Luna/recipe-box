const { Router } = require("express");
const router = Router();

//Login routes
router.use('/login', require('./login'));


module.exports = router;