var modelUsers = new (require('../models/users.js'))();
var Base = require('./base.js');
var fs = require("fs");

class Home extends Base {

    renderHome(req, res) {
        
        var offset = (req.query.offset && req.query.offset - 1) || 0; 
        var paramType = req.params.type;
        var type="";
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

                var qr = "select * from posts p, users u where p.user_id = u.user_id "+type+" order by p."+ req.session.postsSortBy +" desc limit " + offset + ", 1";
                console.log("homeq", qr);
                app.db.mysql.query(qr, cb);
            },
            function(cb) {
                //page should be loaded for non logged in user as well and for non logged in user there are no activitis
                //for videos or images there will be no activities that is handled with `type` variable
                if(!req.session.user || type) {
                    return cb(null)
                }

                //fetch activities for logged in user
                var qr  = "select ua.user_activity_type, ua.username as ua_username, ua.comment, ua.created, p.*, u.* from user_activities ua, posts p, users u where ua.post_id = p.post_id and p.user_id = u.user_id and ua.username in ('"+req.session.user.friends.join("','")+"') order by ua.created desc limit " +offset + ", 1";
                console.log("QR2", qr)
                app.db.mysql.query(qr, cb);
            }
        ],
        function(err, results) {
            
            console.log("FINAL", results);

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
                activities : activities,
                type : req.params.type    
            };
            
            console.log("HOME viewData", viewData,results)

            if(offset) {
                res.render('posts_pagination', viewData);
            } else {
                res.render('home', viewData);
            }
        });

    }

    renderKYC(req, res) {
        var viewData = {
            user : req.session.user
        };
        res.render('add_kyc', viewData);
    }

    insertKYC(req, res) {

        let uploadPath = __dirname + "/../../public/" + app.config.uploads.kyc + "/";

        let addressProof = req.files.address_proof;
        let addressProofFileName =  "address_proof_" + req.session.user.user_id + "." + addressProof.name;
        
        let idProof = req.files.identity_proof;
        let idProofFileName = "id_proof_" + req.session.user.user_id + "." + idProof.name;

        app.lib.async.parallel([
            function(cb) {
                addressProof.mv(uploadPath + addressProofFileName, cb)
            },
            function(cb) {
                idProof.mv(uploadPath + idProofFileName, cb)
            }
        ],function(err){
            console.log("asdfafd",err);
            if(err) {
                return res.redirect('/error');
            }

            var data = req.body; 
            data.user_id = req.session.user.user_id;
            data.address_proof = app.config.host + "/" + app.config.uploads.kyc +"/"+ addressProofFileName;
            data.identity_proof = app.config.host + "/" + app.config.uploads.kyc +"/"+ idProofFileName;
            data.updated = null;
            
            req.session.user.kyc = data;
            req.session.user.status = 'KYC_ADDED';

            modelUsers.fetch('kyc', '*', {user_id:req.session.user.user_id}, null, null, null, function(err, results){
                if(results.length == 0) {

                    modelUsers.insert('kyc', data, function(err){
                        if(err) {
                            console.log(err);
                            return res.redirect('/error')
                        }
                        modelUsers.update('users', {status:'KYC_ADDED'}, {user_id:req.session.user.user_id},()=>{}); 
                        res.redirect('/settings/kyc');
                    });

                } else {

                    modelUsers.update('kyc', data, {user_id:req.session.user.user_id}, function(err){
                        if(err) {
                            console.log(err);
                            return res.redirect('/error')
                        }
                        modelUsers.update('users', {status:'KYC_ADDED'}, {user_id:req.session.user.user_id},()=>{}); 
                        res.redirect('/settings/kyc');
                    });

                }

                

            });

            
        });
    }

    createPost(req, res) {
        console.log("erreq", req.body, req.files);
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

        console.log("evdfa", uploadPath, mediaFileName, mediaFilePath, mediaFile);
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
                    console.log("asdfadfsa",uploadParams, err, data);
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
                console.log("FINALLL", err, results, postData);
                postData.username = req.session.user.username;
                postData.post_id = results.insertId;
                postData.like_count = 0;
                postData.comment_count = 0;
                postData.share_count = 0;
                postData.user_activity_type = false;
                postData.created = new Date();
                postData.image = (req.session.user && req.session.user.image) || "",
                res.render('single_post', postData)
            });
        });
    }

    renderKYCOfUser(req, res) {
        modelUsers.fetch('kyc', '*', {user_id:req.params.userid}, null, null, null, function(err, results){
            if(err) {
                return res.redirect('/');
            }
            var kycData = results[0];
            kycData.gender = kycData.gender == 'M' ? 'Male' : 'Female';
            
            var viewData = {
                kyc : kycData,
                msg : req.query.msg,
                user : req.session.user
            };

            console.log("asdfad",viewData, results, results[0]['first_name'])

            res.render('kyc', viewData);
        })    
    }

    getTokenAmount(req, res) {

        var symbol = req.query.symbol;
        var curr_amount = req.query.curr_amount;

        if(symbol == 'USD') {
            var tokens = curr_amount / app.config.tokenPrice;
            return res.json({tokens:tokens});
        }

        var reqOptions = {
            method : "get",
            uri : app.config.apiCurrency.apiUrl,
            qs : {
                symbol : symbol
            },
            headers: {
                'X-CMC_PRO_API_KEY': app.config.apiCurrency.apiKey
            },
            json: true,
            gzip: true
        };

        app.lib.request(reqOptions, function(err, response, body){
            if(err) {
                return res.status(500).json(err);
            }

            var dollars = curr_amount * body.data[symbol]["quote"]["USD"]["price"];

            var tokens = dollars / app.config.tokenPrice;

            console.log(body.data[symbol]["quote"]["USD"]["price"], app.config.tokenPrice, dollars, tokens);
            res.json({tokens:tokens});
        });
    }
    
    insertBuyOrders(req, res) {  

        var depositAddress;
        
        modelUsers.fetch('user_deposit_addresses', 'address', { user_id : req.session.user.user_id, symbol : req.body.buy_with}, null, null, null, function(err, results){

            console.log('user_deposit_addresses', results);

            if(results[0]) {

                depositAddress = results[0].address;

            } else {

                var arrDepositAddress = app.lib.common.generateAddress(req.body.buy_with);
                depositAddress = arrDepositAddress[0];

                //insert user address
                var userAddressData = {
                    user_id : req.session.user.user_id,
                    symbol : req.body.buy_with,
                    address : arrDepositAddress[0],
                    private_key : arrDepositAddress[1],
                };

                console.log('userAddressData', userAddressData);

                modelUsers.insert('user_deposit_addresses', userAddressData, ()=>{});
            }

            var data = {
                user_id : req.session.user.user_id,
                symbol : req.body.buy_with,
                deposit_address : depositAddress,
                from_address : req.body.from_address,
                to_address : req.body.to_address,
                symbol_amount : req.body.curr_amount,
                token_amount : req.body.token_amount
            };

            console.log('dataasdf', data);
            
            modelUsers.insert('buy_orders', data, function(err, results){
                if(err) {
                    console.log(err);
                    if(err) {
                        return res.status(500).json(err);
                    }
                }
                
                res.json({depositAddress : depositAddress});
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
            console.log("here34524", err, results);
            if(err) 
                return res.status(400).json({status : "FAIL"});
            
            var qr = "update posts set comment_count = comment_count + 1 where post_id = " + req.body.post_id;
            app.db.mysql.query(qr);

            var commentData = {
                comment : req.body.comment,
                username : req.session.user.username,
                commentTime : "just now"
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

        var qr = 'select * from users where username like "%'+search+'%" limit '+offset+', 1';
        console.log("QR", qr);
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
        console.log("asdfasdf",qr)
        app.db.mysql.query(qr, function(err, results){
            console.log("asdfasdf",qr, results, err)
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
                console.log("dfadsFF", objInsert, results);
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
        console.log("erreq", req.body, req.files);
        let uploadPath = __dirname + "/../../public/" + app.config.uploads.uploadpath + "/";
        let mediaFile = req.files && req.files.filePP;
        let mediaFilePath = mediaFile && uploadPath + new Date().getTime() + mediaFile.name;
        let mediaFileName = mediaFile && new Date().getTime() + mediaFile.name;
        var awsMediaPath = "";
        
        console.log("evdfa", uploadPath, mediaFileName, mediaFilePath, mediaFile);
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
                    console.log("asdfadfsa",uploadParams, err, data);
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

                var qr = "select * from posts p, users u where p.user_id = u.user_id and p.post_type = '"+type+"' order by p."+ req.session.postsSortBy +" desc limit " + offset + ", 1";
                console.log("homeq", qr);
                app.db.mysql.query(qr, cb);
            }
        ],
        function(err, results) {
            
            console.log("FINAL", results);

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
            
            console.log("HOME viewData", viewData,results)

            if(offset) {
                res.render('posts_pagination', viewData);
            } else {
                res.render('home', viewData);
            }
        });

    }

}

module.exports = Home;