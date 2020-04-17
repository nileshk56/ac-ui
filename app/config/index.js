/**
 * @Author  : Nilesh Kangane
 * @Desc    : Load config according to envirnoment
 */

 module.exports = function(env) {
    env = env || 'dev';
    app.config = require("./" + env + ".js");
 }
