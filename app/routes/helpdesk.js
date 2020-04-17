var router = require('express').Router();
var helpDeskController = new (require('../controllers/helpdesk.js'))();

router.get('/', helpDeskController.renderHelpdesk);
router.post('/ticket', helpDeskController.raiseTicket);
router.get('/ticket/:ticketId', helpDeskController.renderTicket);
router.post('/ticket/comments', helpDeskController.addTicketComment);
router.get('/ticket/:ticketId/close', helpDeskController.closeTicket);


module.exports = router