var nodemailer = require('nodemailer');

var mongoose = require('mongoose');
var User = mongoose.model('User');

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

var mailer = {
    sendMail: function (to, subject, html, text) {
        var query = User.findOne({username: to});
    
        query.exec(function(err, user) {
            if (err) {return next(err);}
            
            if (!user) {return next(new Error("Can't find user"));}
            console.log(user);
            console.log('Sending mail to: ' + user.email);
            mailOptions.to = user.email;

            mailOptions.subject = subject;
            mailOptions.html = html;
            mailOptions.text = text;
            
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);
            }); 
        });
    },

    sendTaskMail: function(to, subject, task) {
        var html = 
            '<html>' + 
            task.description + 
            '<br><br><a href="' + 
            process.env.SERVER_LOC + 
            'tasks/' + 
            task._id + 
            '">Open Task</a></html>';
        this.sendMail(to, subject, html, task.description);
    },

    sendCommentMail: function(to, subject, comment) {
        var html = 
            '<html>' + 
            comment.body + 
            '<br><br><a href="' + 
            process.env.SERVER_LOC + 
            'tasks/' + 
            comment.task._id + 
            '">Open Task</a></html>';

        this.sendMail(to, subject, html, comment.body);
    }
}

// send mail with defined transport object
module.exports = mailer;