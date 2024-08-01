const cron = require('node-cron');
const jobQueue = require('../queues/jobQueue');

// Define the cron schedule for 11 AM Pakistan time (PST) which is 9 AM Saudi time (AST)
cron.schedule('0 11 * * *', async () => { // 11 AM PST is 9 AM AST
    try {
        await jobQueue.add('generateReport', {
            reportType: 'finance',
            data: []
        });
        console.log('Scheduled finance report job.');

        await jobQueue.add('generateReport', {
            reportType: 'analytics',
            data: []
        });
        console.log('Scheduled analytics report job.');
    } catch (error) {
        console.error('Failed to schedule report jobs:', error);
    }
});
