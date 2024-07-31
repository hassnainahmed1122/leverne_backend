const nodemailer = require('nodemailer');

const PASSWORD = process.env.EMAIL_PASSWORD;

async function send365Email() {
    const transportOptions = {
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: { user: 'returns@thnyan.com', pass: 'S/278107114807ol' },
        logger:true,
        // secureConnection: true,
        tls: { ciphers: 'SSLv3' }
    };

    const mailTransport = nodemailer.createTransport(transportOptions);

    try {
        await mailTransport.sendMail({
            from: 'returns@thnyan.com',
            to: 'hassnainahmed111222@gmail.com',
            replyTo: 'returns@thnyan.com',
            subject: 'test purpose',
            html: '<i>Hello World</i>',
            text: 'hello world'
        });
        console.log(`Email sent to hassnainahmed111222@gmail.com`);
    } catch (err) {
        console.error(`Error sending email to :`, err);
        throw err;
    }
}

module.exports = { send365Email };
