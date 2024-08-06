const { RefundItem, OrderItem, sequelize } = require('../models');

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

    } catch (err) {
        console.error('Error creating refund items or updating OrderItem quantities:', err);
        throw err; 
    }
};

module.exports = { refundItemProcessor };
