const express = require("express");
const router =express.Router();
const usersController = require('../controllers/usersController');
const verifyJWT = require("../middlewares/verifyJWT");


router.use(verifyJWT ) ;
router.route("/").get(usersController.getAllUsers);
module.exports = router;