module.exports = {
    host : 'http://localhost:5600',
    serverPort : 5600,
    db : {
        mysql : {
            host            : "nk-db.c1mxmujfpbmz.us-east-1.rds.amazonaws.com",
            user            : "nilesh56",
            password        : "nilesh56",
            database        : "nkdb"
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
        kyc : 'uploads/kyc'
    },
    apiCurrency : {
        apiUrl : "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
        apiKey : "f8f4410d-cfb0-49d7-9368-6abc3b2a73f6"
    },
    tokenPrice : 0.1,
    referral : {
        amount : {
            BTC : 0.001
        }
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
    web3Provider : 'https://ropsten.infura.io/v3/47f43051815b405c95ae4db291d6b2e3'
};