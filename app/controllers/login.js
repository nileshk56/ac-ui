var modelUsers = new (require('../models/users.js'))();
var Base = require('./base.js');
var randomstring = require("randomstring");

class Login extends Base {

    renderLogin(req, res) {
        var msg = req.session.msg || {};
        delete req.session.msg;
        var viewData = {
            msg : msg.body
        };
        
        res.render('login', viewData);
    }

    signIn(req, res) {
        
        var objWhere = {
            username : req.body.username,
            password : req.body.password
        };

        modelUsers.fetch('users', '*', objWhere, null, 10, 0, function(err, results){
            
            if(err) {
                console.log(err);
                return res.redirect('/error');
            }

            if(results.length == 0) {
                req.session.msg = {
                    body : "Wrong Email or Password!"
                }
                return res.redirect('/login');
            }

            req.session.user = results[0];
        

            app.lib.async.parallel([
                //prepare notification count
                function(cb) {
                    var qr = "SELECT count(*) as NOTIFICATION_COUNT from friends where friendship_status = 'SENT' and to_username = '" + req.session.user.username + "'";
                    app.db.mysql.query(qr, function(err, results){
                        console.log("nrere", results, qr);
                        req.session.user.notificationCount = results[0] && results[0]['NOTIFICATION_COUNT'];
                        cb(null)
                    });
                },
                //fetch all friends
                function(cb) {
                    var qr = "SELECT from_username FROM friends where to_username = '" + req.session.user.username + "'";
                    console.log("asdf",qr);
                    app.db.mysql.query(qr, function(err, results){
                        var arrFriends = [];
                        for(var i = 0 ; i<results.length; i++) {
                            arrFriends.push(results[i]["from_username"])
                        }
                        req.session.user.friends = arrFriends;
                        console.log("nrere", arrFriends,results, qr);
                        
                        cb(null)
                    });
                }
            ], function(err) {
                if(err)
                    return res.redirect('/error');
                
                res.redirect('/');
            });

            
            /*app.lib.async.parallel([
                //load kyc data
                function(cb) {
                    
                    modelUsers.fetch('kyc', '*', {user_id:results[0]['user_id']}, null, 10, 0, function(err, kycRes){
                        
                        if(err) 
                            return cb(err)
                            
                        if(kycRes.length == 0) {
                            req.session.user.kycDone = false;
                            req.session.user.kyc = {};
                        } else {
                            req.session.user.kycDone = true;
                            req.session.user.kyc = kycRes[0];
                        }
                        
                        cb();
                    });
                },

                //load address of the users
                function(cb) {
                    modelUsers.fetch('user_addresses', '*', {user_id:results[0]['user_id']}, null, 10, 0, function(err, results){
                        
                        if(err) 
                            return cb(err)

                        if(results.length == 0) {
                            req.session.user.userAddresses = {};
                        } else {
                            req.session.user.userAddresses = results[0];
                        }

                        cb();
                    });
                }
                ], function(err) {
                if(err)
                    return res.redirect('/error');
                
                res.redirect('/');
            }); */

        });
    }

    signUp(req, res) {

        //var emailVerificationCode = randomstring.generate(7);
        var userdata = {
            username : req.body.username,
            password : req.body.password,
            gender : req.body.gender,
            //email_verification_code : emailVerificationCode
        };

        modelUsers.insert('users', userdata, function(err, results){
            
            if(err) {
                console.log("err", err);
                if(err.errno == 1062){
                    req.session.msg = {
                        body : "Email already exists!"
                    };
                    return res.redirect('/login');
                }

                return res.redirect('/error')
            }
            req.session.msg = { 
                body : "SignUp Successfull, Please login to continue!"
            };

            res.redirect('/login');

            //send email for verifying email

            /*var mailOptions = {
                from: 'info@wharfstreettechnologies.com',
                to: req.body.email,
                subject: 'Verify your email account',
                html: '<p>Dear User, <br><br><br> Welcome to Wharf Street STO, Please verify your account by clicking on following link <br><br><a href="'+app.config.host+'/login/verifyemail?c='+emailVerificationCode+'"><h3>Click Here</h3></a><br><br><br>Thanks<br>Team WharfStreet</p>'
            };

            app.lib.mailer.sendMail(mailOptions, (err)=>{console.log("mailerr", err)});

            var refData = {
                user_id : results.insertId,
                referral_code : randomstring.generate(7),
                parent_referral_code : req.body.referral
            };

            modelUsers.insert('referrals', refData, function(err, results){
                res.redirect('/login?msg=SignUp Successfull, Please login to continue!');
            });*/

        });    
    }

    logout(req, res){
        req.session.destroy(()=>{res.redirect('/login')});
    }

    verifyEmail(req, res){
        var code = req.query.c;

        modelUsers.update('users', {email_verification_code:'Y'}, {email_verification_code:code}, function(err, results){
            res.redirect("/login?msg=Email Verified, Please login again");
        });
    }

}

module.exports = Login;