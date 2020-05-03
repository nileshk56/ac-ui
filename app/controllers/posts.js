var modelUsers = new (require('../models/users.js'))();
var Base = require('./base.js');
var fs = require("fs");

class Posts extends Base {

    getAllPost(req, res) {
        var postId = req.params.postId;
        var offset = (req.query.offset && req.query.offset - 1) || 0; 
        var paramType = req.params.type;
        var type="";
        var msg  = req.session.msg || {};
        delete req.session.msg;
        

        //NEW
        app.lib.async.parallel([
            function(cb) {
                var qr = "select * from posts p, users u where p.user_id = u.user_id and p.post_id = "+postId;
                
                app.db.mysql.query(qr, cb);
            },
            function(cb) {
                //we want to show user lots of new posts if we keep only sort by like_count then user will see same posts
                //save above sortby in session so for further more/pagination request we will show him the sorted posts
                //this sortby stored in session is used in renderPosts()
                //if !offset means its first page and set the session for sort order
                if(!offset) {
                    req.session.postsSortBy = (Math.floor(Math.random()*10) % 2 == 0) ? "like_count" : "created";
                }

                //show logged in user only most liked content
                if(!req.session.user) {
                    req.session.postsSortBy = "like_count"
                }

                var qr = "select * from posts p, users u where p.user_id = u.user_id order by p."+ req.session.postsSortBy +" desc limit " + offset + ", 10";
                
                app.db.mysql.query(qr, cb);
            },
        ],
        function(err, results) {
            
            console.log("err,", err, results);
            
            var posts = results[0] && results[0][0] || [];
            var otherPosts = results[1] && results[1][0] || [];
            
            posts = posts.concat(otherPosts);

            if(offset && posts.length == 0 ) {
                return res.json({
                    status : "FAIL"
                });
            }

            posts.map(function(post){
                post.isLoggedIn = req.session.user ? true : false;
                return post;
            }); 

            var viewData = {
                user : req.session.user,
                msg : msg.body,
                posts : posts,
                type : "",
                activities : false
            };
            
            delete req.session.msg;

            if(offset) {
                res.render('posts_pagination', viewData);
            } else {
                res.render('home', viewData);
            }
        });

    }

}

module.exports = Admin;