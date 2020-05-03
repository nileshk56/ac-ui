var modelUsers = new (require('../models/users.js'))();
var Base = require('./base.js');
var fs = require("fs");

class Home extends Base {

    renderHome(req, res) {
        
        var offset = (req.query.offset && req.query.offset - 1) || 0; 
        var paramType = req.params.type;
        var type="";
        var msg  = req.session.msg || {};
        delete req.session.msg;
        switch(paramType) {
            case "videos" :
                type = "and p.post_type = 'V'";
                break;
            case "images" :
                type = "and p.post_type = 'I'";
                break;
            case "text" :
                type = "and p.post_type = 'T'";
                break;
        }

        //NEW
        app.lib.async.parallel([
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

                var qr = "select * from posts p, users u where p.user_id = u.user_id "+type+" order by p."+ req.session.postsSortBy +" desc limit " + offset + ", 10";
                
                app.db.mysql.query(qr, cb);
            },
            function(cb) {
                //page should be loaded for non logged in user as well and for non logged in user there are no activitis
                //for videos or images there will be no activities that is handled with `type` variable
                if(!req.session.user || type) {
                    return cb(null)
                }

                //fetch activities for logged in user
                var qr  = "select ua.user_activity_type, ua.username as ua_username, ua.comment, ua.created, p.*, u.* from user_activities ua, posts p, users u where ua.post_id = p.post_id and p.user_id = u.user_id and ua.username in ('"+req.session.user.friends.join("','")+"') order by ua.created desc limit " +offset + ", 10";
                
                app.db.mysql.query(qr, cb);
            }
        ],
        function(err, results) {
            
            
            var posts = results[0] && results[0][0] || [];
            var activities = results[1] && results[1][0] || [];

            if(offset && posts.length == 0 && activities.length == 0) {
                return res.json({
                    status : "FAIL"
                });
            }

            posts.map(function(post){
                post.isLoggedIn = req.session.user ? true : false;
                return post;
            });
            activities.map(function(post){
                post.isLoggedIn = req.session.user ? true : false;
                return post;
            }); 

            var viewData = {
                user : req.session.user,
                msg : msg.body,
                posts : posts,
                activities : activities,
                type : req.params.type    
            };
            
            delete req.session.msg;

            if(offset) {
                res.render('posts_pagination', viewData);
            } else {
                res.render('home', viewData);
            }
        });

    }

    createPost(req, res) {
        
        let uploadPath = __dirname + "/../../public/" + app.config.uploads.uploadpath + "/";
        let mediaFile = req.files && req.files.filePostsMedia;
        let mediaFilePath = mediaFile && uploadPath + new Date().getTime() + mediaFile.name;
        let mediaFileName = mediaFile && new Date().getTime() + mediaFile.name;
        let postType = "T";
        var awsMediaPath = "";
        
        if(mediaFile && app.config.mimeTypes.images.indexOf(mediaFile.mimetype)>-1) {
            postType = "I";
        } else if(mediaFile && app.config.mimeTypes.videos.indexOf(mediaFile.mimetype)>-1) {
            postType = "V";
        } 

        app.lib.async.auto([
            //move file
            function(cb) {
                if(!mediaFile)
                    return cb(null);
    
                    mediaFile.mv(mediaFilePath, cb); 
            },
            //write to s3
            function (cb, results) {
                if(!mediaFile)
                    return cb(null);
                
                var s3 = new app.lib.AWS.S3({apiVersion: '2006-03-01'});
                var uploadParams = {
                    Bucket: "nk-s3", 
                    Key: app.config.uploads.s3UploadPath + "/" +mediaFileName, 
                    Body: fs.createReadStream(mediaFilePath),
                    ContentType: mediaFile.mimetype,
                    ACL: 'public-read'
                };

                s3.upload (uploadParams, function (err, data) {
                    
                    if(err)
                        return cb(err);
                    
                        awsMediaPath = data.Location;   
                    fs.unlink(mediaFilePath, function(err){
                        cb(data);
                    });    
                });
            }
        ], function(err, results) {
            var postData = {
                post_type : postType,
                post_desc : req.body.txtPost,
                media_path : awsMediaPath,
                user_id : (req.session.user && req.session.user.user_id) || 0,
                username : (req.session.user && req.session.user.username) || "",
                
            };
            modelUsers.insert('posts', postData, (err, results)=>{
                
                postData.username = req.session.user.username;
                postData.post_id = results.insertId;
                postData.like_count = 0;
                postData.comment_count = 0;
                postData.share_count = 0;
                postData.user_activity_type = false;
                postData.created = new Date();
                postData.image = (req.session.user && req.session.user.image) || "",
                postData.isLoggedIn = true;
                res.render('single_post', postData)
            });
        });
    }

    like(req, res){
        var postId = req.params.postId;
        var objUserActivities = {
            user_activity_type : 'LIKE',
            post_id : postId,
            user_id : req.session.user.user_id,
            username : req.session.user.username
        };

        modelUsers.fetch('user_activities', '*', objUserActivities, null, 1, 0, function(err, results){
            
            if(results.length) {
                return res.status(400).json({status : "FAIL"});
            }
            modelUsers.insert('user_activities', objUserActivities);
            var qr = "update posts set like_count = like_count + 1 where post_id = " + postId;
            app.db.mysql.query(qr);

            res.json({status : "SUCCESS"});
        });

    }

    comment(req, res) {
        var objUserActivities = {
            user_activity_type : 'COMMENT',
            post_id : req.body.post_id,
            comment : req.body.comment,
            user_id : req.session.user.user_id,
            username : req.session.user.username
        };

        modelUsers.insert('user_activities', objUserActivities, function(err, results){
            
            if(err) 
                return res.status(400).json({status : "FAIL"});
            
            var qr = "update posts set comment_count = comment_count + 1 where post_id = " + req.body.post_id;
            app.db.mysql.query(qr);

            var commentData = {
                comment : req.body.comment,
                username : req.session.user.username,
                created : new Date()
            };

            res.render('single_comment', commentData);
        });
    }

    share(req, res){
        var postId = req.params.postId;
        var objUserActivities = {
            user_activity_type : 'SHARE',
            post_id : postId,
            user_id : req.session.user.user_id,
            username : req.session.user.username
        };

        modelUsers.insert('user_activities', objUserActivities);
        var qr = "update posts set share_count = share_count + 1 where post_id = " + postId;
        app.db.mysql.query(qr);

        res.json({status : "SUCCESS"});   
    }

    search(req, res) {
        var search = req.query.search;
        var offset = req.query.offset ? req.query.offset-1 : 0;

        var qr = 'select * from users where username like "%'+search+'%" order by username asc limit '+offset+', 10';
        
        app.db.mysql.query(qr, function(err, results){

            var viewData = {
                user : req.session.user,
                msg : (req.session.msg && req.session.msg.body) || '',
                users : results,
                offset : offset,
                searchTxt : search    
            }
            res.render('search', viewData);

        });
    }

    notifications(req, res){
        
        var qr = 'SELECT * FROM users u, friends f where u.username = f.from_username and f.friendship_status="SENT" and f.to_username="'+req.session.user.username+'" order by f.created desc limit 100';
        
        app.db.mysql.query(qr, function(err, results){
            
            var viewData = {
                user : req.session.user,
                msg : (req.session.msg && req.session.msg.body) || '',
                users : results   
            }
            res.render('notifications', viewData);
        });
    }

    updatefriendrequest(req, res){
        var frId = req.query.frid;
        var frAction = req.query.fraction;

        if(frAction == "CONFIRM") {
            modelUsers.update('friends', {"friendship_status":"CONFIRM"}, {user_friend_id : frId});
            res.json({"status" : "Confirmed"});
            
            modelUsers.fetch('friends', '*', {user_friend_id : frId}, null, 1, 0, function(err, results){
                var data = results[0];
                var objInsert = {
                    friendship_status : "CONFIRM",
                    to_username : data['from_username'],
                    from_username : data['to_username']
                };
                
                modelUsers.insert('friends', objInsert)
            });
        }

        if(frAction == "REJECT") {
            var qr = "DELETE FROM friends where user_friend_id = " + frId;
            app.db.mysql.query(qr);
            res.json({"status" : "Rejected"});
        }
    }

    renderUpp(req, res) {
        
        var viewData = {
            user : req.session.user,
            msg : (req.session.msg && req.session.msg.body) || '',
        };

        res.render('upp', viewData);
    }

    upp(req, res) {
        
        let uploadPath = __dirname + "/../../public/" + app.config.uploads.uploadpath + "/";
        let mediaFile = req.files && req.files.filePP;
        let mediaFilePath = mediaFile && uploadPath + new Date().getTime() + mediaFile.name;
        let mediaFileName = mediaFile && new Date().getTime() + mediaFile.name;
        var awsMediaPath = "";
        
        app.lib.async.auto([
            //move file
            function(cb) {
                mediaFile.mv(mediaFilePath, cb); 
            },
            //write to s3
            function (cb, results) {
                
                var s3 = new app.lib.AWS.S3({apiVersion: '2006-03-01'});
                var uploadParams = {
                    Bucket: "nk-s3", 
                    Key: app.config.uploads.s3UploadPath + "/" + mediaFileName, 
                    Body: fs.createReadStream(mediaFilePath),
                    ContentType: mediaFile.mimetype,
                    ACL: 'public-read'
                };

                s3.upload (uploadParams, function (err, data) {
                    
                    if(err)
                        return cb(err);
                    
                        awsMediaPath = data.Location;   
                    fs.unlink(mediaFilePath, function(err){
                        cb(data);
                    });    
                });
            }
        ], function(err, results) {
            
            modelUsers.update('users', {image:awsMediaPath}, {user_id : req.session.user.user_id}, function(err, data){
                req.session.user.image = awsMediaPath;
                //res.json({status:"SUCCESS"});
                res.redirect("/upp")
            });
        });
    }

    download(req, res) {
        var url = req.query.url;
        var filename = url.substring(url.lastIndexOf('/')+1);
        res.attachment(filename);
        app.lib.request.get(url).pipe(res)
    }

    renderFocues(req, res) {
        
        var offset = (req.query.offset && req.query.offset - 1) || 0; 
        var type = req.query.type || '';

        //NEW
        app.lib.async.parallel([
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

                var qr = "select * from posts p, users u where p.user_id = u.user_id and p.post_type = '"+type+"' order by p."+ req.session.postsSortBy +" desc limit " + offset + ", 10";
                
                app.db.mysql.query(qr, cb);
            }
        ],
        function(err, results) {
            
            
            var posts = results[0] && results[0][0] || [];
            var activities = results[1] && results[1][0] || [];

            if(posts.length == 0 && activities.length == 0) {
                return res.json({
                    status : "FAIL"
                });
            }

            var viewData = {
                user : req.session.user,
                msg : (req.session.msg && req.session.msg.body) || '',
                posts : posts,
                activities : activities    
            };
            
            if(offset) {
                res.render('posts_pagination', viewData);
            } else {
                res.render('home', viewData);
            }
        });

    }

    getComments(req, res) {
        var qr = "select u.image, ua.* from users u, user_activities ua where u.user_id = ua.user_id and ua.post_id="+req.params.postId+" order by ua.created desc limit 0, 15";
                
        app.db.mysql.query(qr, function(err, results){
            
            var viewData = {
                comments : results 
            };
            res.render('comments', viewData)
        });
    }

    getPost(req, res) {
        var postId = req.params.postId;
        var offset = (req.query.offset && req.query.offset - 1) || 0; 
        var paramType = req.params.type;
        var type="";
        var msg  = req.session.msg || {};
        delete req.session.msg;
        

        //NEW
        app.lib.async.auto({
            postData : function(cb) {
                var qr = "select * from posts p, users u where p.user_id = u.user_id and p.post_id = "+postId;
                console.log("asdf", qr)
                app.db.mysql.query(qr, cb);
            },
            otherPostsData : ["postData", function( results, cb) {
                console.log("RESSPP",results.postData[0][0]);
                var postData = results.postData[0][0];
                
                var tagCond="";
                if(postData.tags) {
                    var tagCond = " and (";
                    postData.tags.split(" ").forEach(function(tag){
                        tagCond += "p.tags like '%"+tag+"%' OR "
                    });
                    tagCond = tagCond.substr(0, tagCond.length-4);
                    tagCond += ")";
                }

                var qr = "select * from posts p, users u where p.user_id = u.user_id and p.post_id <> "+postId + tagCond+" limit 20";
                console.log("asdf", qr)
                app.db.mysql.query(qr, cb);
            }],
        },
        function(err, results) {
            
            var posts = results.postData[0] || [];
            var otherPosts = results.otherPostsData[0] || [];
            
            posts.map(function(post){
                post.isLoggedIn = req.session.user ? true : false;
                return post;
            });
            otherPosts.map(function(post){
                post.isLoggedIn = req.session.user ? true : false;
                return post;
            }); 

            var viewData = {
                user : req.session.user,
                msg : msg.body,
                post : posts[0],
                otherPosts : otherPosts,
                type : "",
                activities : false,
                isLoggedIn : req.session.user ? true : false
            };
            
            delete req.session.msg;

            res.render("post", viewData);
        });

    }

    getAllPost(req, res) {
        
        var offset = parseInt(req.query.offset) || 0;
        var msg  = req.session.msg || {};
        delete req.session.msg;

        //NEW
        app.lib.async.parallel([
            function(cb) {
                var qr = "select * from posts p, users u where p.user_id = u.user_id order by p.created limit "+offset+", 20";
                console.log("QR", qr);
                app.db.mysql.query(qr, cb);
            }
        ],
        function(err, results) {
            
            console.log("err,", err, results);
            
            var posts = results[0] && results[0][0] || [];
            
            console.log("qr", posts[0]);

            var viewData = {
                user : req.session.user,
                msg : msg.body,
                posts : posts,
                type : "",
                isLoggedIn : req.session.user ? true : false,
                offset : offset,
                showPagination : posts.length
            };
            
            delete req.session.msg;

            res.render('allposts', viewData);
        });

    }

    getTagData(req, res) {
        
        var offset = parseInt(req.query.offset) || 0;
        var msg  = req.session.msg || {};
        delete req.session.msg;
        var tag = req.params.tag;

        //NEW
        app.lib.async.parallel([
            function(cb) {
                var qr = "select * from posts p, users u where p.user_id = u.user_id and tags like '%"+tag+"%' order by p.like_count limit "+offset+", 20";
                console.log("QR", qr);
                app.db.mysql.query(qr, cb);
            }
        ],
        function(err, results) {
            
            console.log("err,", err, results);
            
            var posts = results[0] && results[0][0] || [];
            
            console.log("qr", posts[0]);

            var viewData = {
                user : req.session.user,
                msg : msg.body,
                posts : posts,
                type : "",
                isLoggedIn : req.session.user ? true : false,
                offset : offset,
                showPagination : posts.length
            };
            
            delete req.session.msg;

            res.render('allposts', viewData);
        });

    }

}

module.exports = Home;