var commonMiddleware = require('../middlewares/common.js')
var loginController = new (require('../controllers/login.js'))();
var homeController = new (require('../controllers/home.js'))();
var userController = new (require('../controllers/user.js'))();

module.exports = function() {
	
	//handle option api
	app.options('*', function(req, res){res.json()});

	//open api's can be accessed without jwt, api's like login,signup etc..
	//app.use('/', require('./public'));
	
	/*app.get('/', commonMiddleware.isLoggedIn, homeController.renderHome);
	app.get('/kyc/:userid', commonMiddleware.isLoggedIn, homeController.renderKYCOfUser);
	app.get('/kyc', commonMiddleware.isLoggedIn, homeController.renderKYC);
	app.post('/kyc', commonMiddleware.isLoggedIn, homeController.insertKYC);
	app.get('/get_tokens_amount', commonMiddleware.isLoggedIn, homeController.getTokenAmount);
	app.post('/buy_tokens', commonMiddleware.isLoggedIn, homeController.insertBuyOrders);

	app.use('/referrals', commonMiddleware.isLoggedIn, require('./referrals'));
	app.use('/helpdesk', commonMiddleware.isLoggedIn, require('./helpdesk'));
	app.use('/settings', commonMiddleware.isLoggedIn, require('./settings'));

	app.get('/login', loginController.renderLogin);
	app.get('/login/verifyemail', loginController.verifyEmail);
	app.post('/login', loginController.signIn);
	app.post('/signup', loginController.signUp);
	app.get('/logout', loginController.logout);*/

	app.get('/', homeController.renderHome);
	app.get('/like/:postId', homeController.like);
	app.get('/share/:postId', homeController.share);
	app.post("/comment", homeController.comment);
	app.post("/post", homeController.createPost);

	app.get('/login', loginController.renderLogin);
	app.post('/login', loginController.signIn);
	app.post('/signup', loginController.signUp);
	app.get('/logout', loginController.logout);

	app.get('/user/:username', userController.renderUser)
};