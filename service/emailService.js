const nodemailer = require('nodemailer');
require('dotenv').config();

async function send365Email({ to, subject, html, text, attachments }) {
    const transportOptions = {
        host: 'smtp.office365.com',
        port: 587,
        auth: { 
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASSWORD 
        },
        tls: {
            ciphers: 'SSLv3'
        }
    };

    const mailTransport = nodemailer.createTransport(transportOptions);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        replyTo: process.env.EMAIL_USER,
        subject,
        html,
        text
    };

    if (attachments && attachments.length > 0) {
        mailOptions.attachments = attachments;
    }

    try {
        await mailTransport.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (err) {
        console.error(`Error sending email to ${to}:`, err);
        throw err;
    }
}

module.exports = { send365Email };
