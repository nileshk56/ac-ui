var request = require('request');

module.exports.request = function(options, cb) {
    
    request(options, function (error, response, body) {
        
        console.log("api call", options, error, body);

        if (!error && response.statusCode == 200) {
            cb(null,body)
        } else {
            cb(error)
        }
    });
}