//this route doesnt need jwt they are public and any one can hit them other routes are accessible to only logged in user
var router = require('express').Router();
var loginController = new (require('../controllers/login.js'))();

router.get('/login', loginController.renderLogin)
router.post('/login', loginController.signIn);
router.post('/signup', loginController.signUp);
router.get('/logout', loginController.logout);

module.exports = router