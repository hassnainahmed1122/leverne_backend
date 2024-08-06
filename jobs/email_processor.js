const { send365Email } = require('../service/emailService');
const { generateEmailTemplate } = require('../utils/helperMethods');

const emailProcessor = async (job) => {
    const { to, city, returnRequestId, aramexPolicyNumber, url } = job.data;

    const { subject, html, text, attachments } = generateEmailTemplate(city, returnRequestId, aramexPolicyNumber, url);
    try {
        await send365Email({ to, subject, html, text, attachments });
        console.log(`Email sent to ${to}`);
    } catch (error) {

        console.error(`Failed to send email to ${to}:`, error);
        throw error;
    }
};

module.exports = { emailProcessor };
