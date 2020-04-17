var modelUsers = new (require('../models/users.js'))();
var Base = require('./base.js');
var WAValidator = require('wallet-address-validator');

class Settings extends Base {

    renderAddressSettings(req, res) {
        
        var viewData = {
            user : req.session.user,
            msg : req.query.msg
        };

        res.render('settings', viewData);
    }

    renderKycSettings(req, res) {
        
        var viewData = {
            action : req.query.action,
            msg : req.query.msg,
            user : req.session.user
        };

        res.render('settings_kyc', viewData);        
    }

    insertAddressSettings(req, res) {
        
        if(!WAValidator.validate(req.body.btc_address, 'BTC'))
            //return res.status(400).json({msg:"Error! Invalid BTC Address"});
            return res.redirect('/settings?msg=Error! Invalid BTC Address')
        
        if(!WAValidator.validate(req.body.eth_address, 'ETH'))
            return res.redirect('/settings?msg=Error! Invalid ETC Address')
            

        var data = {
            user_id : req.session.user.user_id,
            btc_address : req.body.btc_address,
            eth_address : req.body.eth_address
        };

        modelUsers.fetch('user_addresses', '*', {user_id:req.session.user.user_id}, null, null, null, function(err, results){
            if(results.length == 0) {

                modelUsers.insert('user_addresses', data, function(err){
                    if(err) {
                        console.log(err);
                        return res.redirect('/error')
                    }
                    req.session.user.userAddresses =  data;
                    res.redirect('/settings');
                });

            } else {

                modelUsers.update('user_addresses', data, {user_id:req.session.user.user_id}, function(err){
                    if(err) {
                        console.log(err);
                        return res.redirect('/error')
                    }
                    req.session.user.userAddresses =  data; 
                    res.redirect('/settings');
                });

            }
        });    
    }

    renderProfile(req, res) {
        var viewData = {
            user : req.session.user,
            msg : req.query.msg
        };

        res.render('settings_profile', viewData);
    }

    changePwd(req, res){
        modelUsers.update('users',{password:req.body.password}, {user_id:req.session.user.user_id}, function(err, results){
            if(err) {
                res.redirect('/error');
            }

            res.redirect("/settings/profile?msg=Password updated successfully !");
        });
    }
}

module.exports = Settings;