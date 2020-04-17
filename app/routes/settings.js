var router = require('express').Router();
var settingsController = new (require('../controllers/settings.js'))();

router.get('/', settingsController.renderAddressSettings);
router.get('/kyc', settingsController.renderKycSettings);
router.post('/addresses', settingsController.insertAddressSettings);
router.get('/profile', settingsController.renderProfile);
router.post('/changepwd', settingsController.changePwd);

module.exports = router