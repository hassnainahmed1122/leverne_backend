const cron = require('node-cron');
const { RefundRequest, sequelize, Sequelize } = require('../models'); 
const jobQueue = require('../queues/jobQueue');

const { Op } = Sequelize;

cron.schedule('* 2 * * *', async () => { 
    try {
        const refundRequests = await RefundRequest.findAll({
            where: {
                aramex_policy_number: {
                    [Op.ne]: null
                }
            }
        });

        const aramexPolicyNumbers = refundRequests.map(req => req.aramex_policy_number);

        if (aramexPolicyNumbers.length > 0) {
            await jobQueue.add('trackShipments', { trackingNumbers: aramexPolicyNumbers });
            console.log('Tracking job added to queue with policy numbers:', aramexPolicyNumbers);
        } else {
            console.log('No aramex policy numbers found.');
        }
    } catch (error) {
        console.error('Failed to schedule tracking job:', error);
    }
});
