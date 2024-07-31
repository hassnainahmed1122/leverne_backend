const { send365Email } = require('../service/emailService');

const emailProcessor = async (job) => {
    if (job.name === 'sendEmail') {
        const { from, to, subject, html, text } = job.data;
        try {
            await send365Email({ from, to, subject, html, text });
            console.log(`Email sent to ${to}`);
        } catch (error) {
            console.error(`Failed to send email to ${to}:`, error);
            throw error;
        }
    } else {
        console.log('Unknown job type:', job.name);
    }
};

module.exports = { emailProcessor };
