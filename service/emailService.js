
const nodemailer = require('nodemailer');
require('dotenv').config();

async function send365Email({ to, subject, html, text }) {
    const transportOptions = {
        host: 'smtp.office365.com',
        port: 587,
        auth: { 
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASSWORD 
        },
        secure: false,
        debug: true,
        logger:true,
        tls: { ciphers: 'SSLv3' }
    };

    const mailTransport = nodemailer.createTransport(transportOptions);

    try {
        await mailTransport.sendMail({
            from: process.env.EMAIL_USER,
            to,
            replyTo: process.env.EMAIL_USER,
            subject,
            html,
            text
        });
        console.log(`Email sent to ${to}`);
    } catch (err) {
        console.error(`Error sending email to ${to}:`, err);
        throw err;
    }
}

module.exports = { send365Email };