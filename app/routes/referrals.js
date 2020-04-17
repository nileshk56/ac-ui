var router = require('express').Router();
var refferalsController = new (require('../controllers/referrals.js'))();

router.get('/', refferalsController.renderRefferals);

module.exports = router