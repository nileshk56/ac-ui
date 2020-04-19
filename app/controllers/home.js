var modelUsers = new (require('../models/users.js'))();
var Base = require('./base.js');
var fs = require("fs");

class Home extends Base {

    renderHome(req, res) {
        
        var offset = (req.query.offset && req.query.offset - 1) || 0; 

        //NEW
        app.lib.async.parallel([
            function(cb) {
                //we want to show user lots of new posts if we keep only sort by like_count then user will see same posts
                //save above sortby in session so for further more/pagination request we will show him the sorted posts
                //this sortby stored in session is used in renderPosts()
                var sortBy = (Math.floor(Math.random()*10) % 2 == 0) ? "like_count" : "created";
                req.session.postsSortBy = {[sortBy] : "DESC"};

                var qr = "select * from posts p, users u where p.user_id = u.user_id order by p."+sortBy+" desc limit " + offset + ", 1";
                console.log("homeq", qr);
                app.db.mysql.query(qr, cb);
            },
            function(cb) {
                modelUsers.fetch('user_activities', '*', {user_id : req.session.user.user_id}, {created:"desc"}, 10, offset, cb);
            }
        ],
        function(err, results) {
            
            var posts = results[0][0] || [];
            
            if(results[1] && results[1].length) {
                posts.concat(results[1][0]);
            }
            
            var viewData = {
                user : req.session.user,
                msg : (req.session.msg && req.session.msg.body) || '',
                posts : posts    
            };
              
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
                username : (req.session.user && req.session.user.username) || ""
            };
            console.log("FINALLL", err, results, postData);
            modelUsers.insert('posts', postData, (err, results)=>{
                postData.username = req.session.user.username;
                postData.post_id = results.insertId;
                postData.like_count = 0;
                postData.comment_count = 0;
                postData.share_count = 0;
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
            if(results) {
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

}

module.exports = Home;