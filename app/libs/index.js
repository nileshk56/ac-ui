
module.exports = function() {

    app.lib = {};

    app.lib._ = require("lodash");
    app.lib.util = require("util");
    app.lib.async = require('async');
    app.lib.request = require('request');
    app.lib.mailer = require('./mailer')
    //app.lib.api = require('./api');
    app.lib.AWS = require("aws-sdk");
    app.lib.common = require('./common');

    //some common initization
    app.lib.AWS.config.update({region:"us-east-1"});

}