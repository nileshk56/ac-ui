module.exports = {
    host : 'http://localhost:5600',
    serverPort : 5600,
    db : {
        mysql : {
            host            : "localhost",
            user            : "nilesh56",
            password        : "nilesh56",
            database        : "ac"
        },
        mongoDB : {
            url     : 'mongodb://localhost:27017',
            db      : 'hc'
        }
    },
    session : {
        secret: 'nilesh',
        cookie: {}
    },
    error : {
        msg : {
            500 : "Internal server error"
        }
    },
    uploads : {
        uploadpath : 'uploads',
        s3UploadPath : "ac/uploads"
    },
    mailer : {
        host: "mail.wharfstreettechnologies.com",
        port: 587,
        secure: false, // upgrade later with STARTTLS
        auth: {
            user: "info@wharfstreettechnologies.com",
            pass: "India$123#"
        },
        tls: {
            rejectUnauthorized: false
        }  
    },
    mimeTypes : {
        images : ["image/gif", "image/jpeg", "image/png"],
        videos : ["video/x-msvideo", "video/mpeg", "video/3gpp", "video/mp4"]
    }
};