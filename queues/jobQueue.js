const { Queue, Worker, QueueEvents } = require('bullmq');
const { job1Processor, job2Processor, job3Processor } = require('../jobs/job_processor.js');
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
        case 'job2':
            await job2Processor(job);
            break;
        case 'job3':
            await job3Processor(job);
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

queueEvents.on('completed', (jobId) => {
    console.log(`Job ${jobId} completed successfully`);
});

queueEvents.on('failed', (jobId, err) => {
    console.log(`Job ${jobId} failed with error: ${err.message}`);
});

module.exports = jobQueue;
