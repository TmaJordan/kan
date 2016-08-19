var nodemailer = require('nodemailer');

var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
};

var transporter = nodemailer.createTransport(smtpConfig);

var mailOptions = {
    from: '"Kan Project Management" <' + process.env.EMAIL + '>', // sender address
};

// send mail with defined transport object
module.exports = function (to, subject, html, text) {
    mailOptions.to = to;
    mailOptions.subject = subject;
    mailOptions.html = html;
    mailOptions.text = text;
    
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
}