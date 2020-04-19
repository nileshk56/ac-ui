var modelUsers = new (require('../models/users.js'))();
var Base = require('./base.js');
var fs = require("fs");

class User extends Base {
    renderUser(req, res){
        var offset = req.query.offset ? req.query.offset - 1 : 0; 
        var username = req.params.username; 
        
        app.lib.async.parallel([
            function(cb) {
                modelUsers.fetch('posts', '*', {username : username}, {created:"desc"}, 1, offset, cb);
            },
            function(cb) {
                modelUsers.fetch('user_activities', '*', {username : username}, {created:"desc"}, 1, offset, cb);
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
                posts : posts,
                username : username,
                offset : offset    
            };
            console.log("asdfad", viewData, results);   
            res.render('user', viewData);
        });
    }

    sendfriendrequest(req, res) {
        
        var objFriendRequest = {
            friendship_status : 'SEND',
            from_username : req.session.user.username,
            to_username : req.params.username
        };

        modelUsers.insert('friends', objFriendRequest);

        res.json({status:"SUCCESS"});
    }

    deletefriendrequest(req, res) {
        
        /*var objFriendRequest = {
            from_username : req.session.user.username,
            to_username : req.params.username
        };

        console.log("objFriendRequest", objFriendRequest);

        modelUsers.delete('friends', objFriendRequest);*/

        var qr = "DELETE FROM friends where from_username='"+req.session.user.username+"' and to_username='"+req.params.username+"'";
        app.db.mysql.query(qr);

        res.json({status:"SUCCESS"});
    }
}

module.exports = User;