var modelUsers = new (require('../models/users.js'))();
var Base = require('./base.js');

class Login extends Base {

    renderLogin(req, res) {
        res.render('login');
    }

    signIn(req, res) {
        
        var objWhere = {
            email : req.body.email,
            password : req.body.password
        };

        modelUsers.fetch('users', '*', objWhere, null, 10, 0, function(err, results){
            
            if(err) {
                return res.redirect('/error');
            }

            if(results.length == 0) {
                return res.redirect('/login');
            }

            req.session.user = results[0];
            res.redirect('/');
        });
    }

    signUp(req, res) {
        modelUsers.insert('users', req.body, function(err){
            if(err) {
                return res.redirect('/error')
            } 

            res.redirect('/login');
        });    
    }

    logout(req, res){
        req.session.destroy(()=>{res.redirect('/login')});
    }

}

module.exports = Login;