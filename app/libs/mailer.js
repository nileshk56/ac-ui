var nodemailer = require('nodemailer');

module.exports = nodemailer.createTransport(app.config.mailer);