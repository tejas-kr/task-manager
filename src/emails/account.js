const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'kayven.jayston@iillii.org',
        subject: 'Thanks for joining in!',
        text: `Welcome to the Task Manager App, ${name}. Let me know how you get along the app.`
    });
}

const sendGoodByeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'kayven.jayston@iillii.org',
        subject: 'Good Bye!',
        text: `Thanks you for being a part of the Task Manager App. We wanted you to stay longer but it could happen. Good Bye ${name}`
    });
}

module.exports = {
    sendWelcomeMail,
    sendGoodByeMail
}