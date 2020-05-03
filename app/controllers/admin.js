var modelUsers = new (require('../models/users.js'))();
var Base = require('./base.js');
var fs = require("fs");

class Admin extends Base {

    insertPost(req, res) {
        
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

}

module.exports = Admin;