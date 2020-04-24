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
                
                var qr  = "select ua.user_activity_type, ua.username as ua_username, ua.comment, ua.created, p.*, u.* from user_activities ua, posts p, users u where ua.post_id = p.post_id and p.user_id = u.user_id and ua.username = ('"+username+"') order by ua.created desc limit " +offset + ", 1";
                console.log("QR2", qr)
                app.db.mysql.query(qr, cb);
            },
            function(cb) {
                modelUsers.fetch('users', '*', {username : username}, null, 1, 0, cb);
            }
        ],
        function(err, results) {
            var posts = results[0][0] || [];
            
            if(results[1][0] && results[1][0].length) {
                posts = posts.concat(results[1][0]);
            }
            
            if(offset && posts.length == 0) {
                return res.json({
                    status : "FAIL"
                });
            }

            posts.map(function(post){
                post.isLoggedIn = req.session.user ? true : false;
                return post;
            });
            var user = results[2][0]
            var viewData = {
                user : req.session.user,
                msg : req.session.msg,
                posts : posts,
                username : username,
                offset : offset,
                image : user[0]["image"]    
            };
            console.log("asdfad", viewData, results);   
            res.render('user', viewData);
        });
    }

    sendfriendrequest(req, res) {
        
        var objFriendRequest = {
            friendship_status : 'SENT',
            from_username : req.session.user.username,
            to_username : req.params.username
        };

        modelUsers.insert('friends', objFriendRequest);

        res.json({status:"SUCCESS"});
    }

    deletefriendrequest(req, res) {
        
        var qr = "DELETE FROM friends where from_username='"+req.session.user.username+"' and to_username='"+req.params.username+"'";
        app.db.mysql.query(qr);

        res.json({status:"SUCCESS"});
    }

    friends(req, res){
        var username = req.params.username;
        var qr = 'SELECT * FROM users u, friends f where u.username = f.from_username and f.friendship_status="CONFIRM" and f.to_username="'+username+'" order by f.created desc limit 100';
        console.log("asdfasdf",qr)
        app.db.mysql.query(qr, function(err, results){
            console.log("asdfasdf",qr, results, err)
            var viewData = {
                user : req.session.user,
                msg : (req.session.msg && req.session.msg.body) || '',
                users : results   
            }
            res.render('user_friends', viewData);
        });
    }

    unfriend(req, res) {
        
        var qr = "DELETE FROM friends where (from_username='"+req.session.user.username+"' and to_username='"+req.params.username+"') or (to_username='"+req.session.user.username+"' and from_username='"+req.params.username+"')";
        app.db.mysql.query(qr);

        var i = req.session.user.friends.indexOf(req.params.username);
        delete req.session.user.friends[i];

        res.json({status:"SUCCESS"});
    }
}

module.exports = User;