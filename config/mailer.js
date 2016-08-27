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
    },

    sendVerifyMail: function(user) {
        var html = 
            '<html>' + 
            'An account has been created for you with Kan Task Management. Please click on the link below to activate your account (You will have to log in again). If you did not create an account, please respond to this email and let me know.' + 
            '<br><br><a href="' + 
            process.env.SERVER_LOC + 
            'api/users/verify/' + 
           user._id + 
            '">Verify Account</a></html>';

        var text = 
            'An account has been created for you with Kan Task Management. Please open the link below in a browser to activate your account. If you did not create an account, please respond to this email and let me know.\n\n' +
             process.env.SERVER_LOC + 
            'api/users/verify/' + 
            user._id;
        console.log('Sending verify mail to: ' + user.email);
        this.sendMail(user.username, 'Please verify your account', html, text);
    }
}

// send mail with defined transport object
module.exports = mailer;