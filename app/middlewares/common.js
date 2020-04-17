module.exports.isLoggedIn = function(req, res, next) {
    
    if(!req.session.user) {
        return res.redirect('/login');
    }
    
    next();
};