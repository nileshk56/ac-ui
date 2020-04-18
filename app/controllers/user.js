var modelUsers = new (require('../models/users.js'))();
var Base = require('./base.js');
var fs = require("fs");

class User extends Base {
    renderUser(req, res){
        var offset = req.query.offset ? req.query.offset - 1 : 0; 
        var username = req.params.username; 
        
        app.lib.async.parallel([
            function(cb) {
                modelUsers.fetch('posts', '*', {username : username}, {created:"desc"}, 5, offset, cb);
            },
            function(cb) {
                modelUsers.fetch('user_activities', '*', {username : username}, {created:"desc"}, 5, offset, cb);
            }
        ],
        function(err, results) {
            
            var posts = results[0][0] || [];
            if(results[1] && results[1].length) {
                posts.concat(results[1][0]);
            }
            var viewData = {
                user : req.session.user,
                msg : req.session.msg,
                posts : posts    
            };
            console.log("asdfad", viewData, results);   
            res.render('user', viewData);
        });
    }
}

module.exports = User;