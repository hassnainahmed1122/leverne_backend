// processors.js or where your worker is defined
const { Queue, Worker, QueueEvents } = require('bullmq');
const { job1Processor } = require('../jobs/job_processor.js');
const { emailProcessor } = require('../jobs/email_processor.js');
const { refundItemProcessor } = require('../jobs/refund_item_processor.js');
const { reportJobProcessor } = require('../jobs/report_job_processor.js');
const { processTamaraRequest } = require('../jobs/tamara_request_processor.js'); // Import new processor
const config = require('../config/config.js');
const env = process.env.NODE_ENV || 'development';
const redisConfig = config[env].redis;

const jobQueue = new Queue('jobQueue', {
    connection: redisConfig
});

const worker = new Worker('jobQueue', async job => {
    switch (job.name) {
        case 'job1':
            await job1Processor(job);
            break;
        case 'sendEmail':
            await emailProcessor(job);
            break;
        case 'createRefundItems':
            await refundItemProcessor(job);
            break;
        case 'generateReport':
            await reportJobProcessor(job);
            break;
        case 'processTamaraRequest': // Add new job type
            await processTamaraRequest(job);
            break;
        default:
            console.log('Unknown job:', job.name);
    }
}, {
    connection: redisConfig
});

const queueEvents = new QueueEvents('jobQueue', {
    connection: redisConfig
});

queueEvents.on('completed', ({ jobId }) => {
    console.log(`Job ${jobId} completed successfully`);
});

queueEvents.on('failed', ({ jobId }, err) => {
    console.log(`Job ${jobId} failed with error: ${err.message}`);
});

module.exports = jobQueue;
