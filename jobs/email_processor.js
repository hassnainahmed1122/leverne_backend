const { send365Email } = require('../service/emailService');

const emailProcessor = async (job) => {
        const { to, subject, html, text } = job.data;
        try {
            await send365Email({ to, subject, html, text });
            console.log(`Email sent to ${to}`);
        } catch (error) {
            console.error(`Failed to send email to ${to}:`, error);
            throw error;
        }
};

module.exports = { emailProcessor };
