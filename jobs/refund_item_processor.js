const { RefundItem, sequelize } = require('../models');
const { createShipmentProcessor } = require('../jobs/aramex_processors.js');

const refundItemProcessor = async (job) => {
    const { refundRequestId, items } = job.data;

    try {
        const transaction = await sequelize.transaction();

        const refundItems = items.map(item => ({
            refund_request_id: refundRequestId,
            product_id: item.product_id,
            quantity: item.quantity,
        }));

        await RefundItem.bulkCreate(refundItems, { transaction });

        await transaction.commit();
        

        const job = {
            data: {
                refund_order_id: refundRequestId 
            }
        }

        await createShipmentProcessor(job)
        
    } catch (err) {
        console.error('Error creating refund items or adding job to queue:', err);
        throw err; 
    }
};

module.exports = { refundItemProcessor };
