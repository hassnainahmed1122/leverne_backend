const { send365Email } = require('../service/emailService');
const { generateEmailTemplate } = require('../utils/helperMethods');

const emailProcessor = async (job) => {
    const { to, city, returnRequestId, aramexPolicyNumber } = job.data;

    const { subject, html, text } = generateEmailTemplate(city, returnRequestId, aramexPolicyNumber);
    try {
        await send365Email({ to, subject, html, text });
        console.log(`Email sent to ${to}`);
    } catch (error) {

        console.error(`Failed to send email to ${to}:`, error);
        throw error;
    }
};

module.exports = { emailProcessor };
