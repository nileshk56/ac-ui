/**
 * @Author  : Nilesh Kangane
 * @Desc    : Initialize App
 */

//settin the namespace "app" 
var express = require('express');
var session = require('express-session');
var fileUpload  = require('express-fileupload');
var commonMiddleware = require('./middlewares/common.js');

global.app = express();

//load configuration
require('./config')('dev'); //dev|prod|qa

//load libraries
require('./libs')();

//Things to initialize before starting the server
app.lib.async.parallel([
    
    // establish connection to Mysql
    require('./libs/db').connectMysql

], initApp);

function initApp(err) {

if(err) {
    console.log("Application initialization failed");
    process.exit();
}

app.use(fileUpload({useTempFiles:false}));
app.use(express.json());
app.use(express.urlencoded()); 

//session
app.use(session(app.config.session));

app.use(commonMiddleware.isMobile);

//set routes
require('./routes')();

    //set static content
app.use(express.static('public'));

//set view engine
app.set('view engine', 'ejs')
app.set('views', './app/views'); 

    app.listen(app.config.serverPort, () => console.log(`Example app listening on port ${app.config.serverPort}!`))
}