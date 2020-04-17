const mysql = require('mysql');

app.db = {};

module.exports.connectMysql = function(cb){
    
    app.db.mysql = mysql.createPool({
        connectionLimit : 10,
        host            : app.config.db.mysql.host,
        user            : app.config.db.mysql.user,
        password        : app.config.db.mysql.password,
        database        : app.config.db.mysql.database,
        dateStrings     : true
    });
    
    cb();
};
 
