var Base = require('./base.js');
var modelBase = new (require('../models/base.js'))();
var randomstring = require("randomstring");

class Helpdesk extends Base {

    renderHelpdesk(req, res) {
        
        app.lib.async.parallel([

            //fetch ticket categories
            function(icb) {
                modelBase.fetch('helpdesk_ticket_categories', '*', null, {category_name:'ASC'}, null, null, icb);
            },

            //fetch raised tickets
            function(icb) {
                modelBase.fetch('helpdesk_tickets', '*', {user_id : req.session.user.user_id} , {created:'DESC'}, 20 , 0, icb);
            }

        ], function(err, results) {

            var objCategories = {};
            for(var i in results[0][0])
                objCategories[results[0][0][i]['category_id']] = results[0][0][i];

            var viewData = {
                user : req.session.user,
                tickets : results[1][0],
                categories : objCategories
            };
    
            res.render('helpdesk', viewData);

        });

        
    }

    raiseTicket(req, res) {
        var objTicket = req.body;
        objTicket.ticket_id = randomstring.generate(10);
        objTicket.user_id = req.session.user.user_id;

        modelBase.insert('helpdesk_tickets', objTicket, (err)=>{
            console.log("adsfae143142", err);
            res.redirect('/helpdesk')
        });
    }

    renderTicket(req, res) {

        app.lib.async.parallel([

            //fetch ticket categories
            function(icb) {
                modelBase.fetch('helpdesk_ticket_categories', '*', null, null, null, null, icb);
            },

            //fetch raised tickets
            function(icb) {
                modelBase.fetch('helpdesk_tickets', '*', {ticket_id : req.params.ticketId} , null, 1, 0, icb);
            },

            //fetch tickets comments
            function(icb) {
                modelBase.fetch('helpdesk_ticket_comments', '*', {ticket_id : req.params.ticketId} , null, null , null, icb);
            }


        ], function(err, results) {

            console.log(results[1][0], "asdfasd", results[2][0]);

            var objCategories = {};
            for(var i in results[0][0])
                objCategories[results[0][0][i]['category_id']] = results[0][0][i];

            var viewData = {
                user : req.session.user,
                ticket : results[1][0][0],
                categories : objCategories,
                comments : results[2][0]
            };
    
            res.render('helpdesk_ticket', viewData);

        });
    }

    closeTicket(req, res) {
        modelBase.update('helpdesk_tickets', {status : 'CLOSE'}, {ticket_id : req.params.ticketId}, function(err){
            res.redirect("/helpdesk");
        });
    }

    addTicketComment(req, res) {
        var objTicket = req.body;
        objTicket.user_id = req.session.user.user_id;
        
        modelBase.insert('helpdesk_ticket_comments', objTicket, function(err){
            console.log("dafeer",err, objTicket)
            res.redirect('/helpdesk/ticket/'+objTicket.ticket_id);
        });
    }
}

module.exports = Helpdesk;