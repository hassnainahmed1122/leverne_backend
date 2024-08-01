const { generateReportAndSendEmail } = require('../service/reportService');

async function reportJobProcessor(job) {
    const { reportType, data } = job.data;
    try {
        await generateReportAndSendEmail(reportType, data);
        console.log(`Report for ${reportType} generated and sent successfully.`);
    } catch (error) {
        console.error(`Failed to generate and send report for ${reportType}:`, error);
        throw error;
    }
}

module.exports = { reportJobProcessor };