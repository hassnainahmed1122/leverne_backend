const { createPickup, trackShipments } = require('../service/aramexService');

async function createShipmentProcessor(job) {
    const { refund_order_id } = job.data;
    try {
        const result = await createPickup(refund_order_id);
        console.log('Shipment created:', JSON.stringify(result));
        return result;
    } catch (error) {
        throw new Error(`Error creating shipment: ${error.message}`);
    }
}

async function trackShipmentsProcessor(job) {
    const { trackingNumbers } = job.data;
    try {
        const result = await trackShipments(trackingNumbers);
        console.log('Tracking result:', result);
        return result;
    } catch (error) {
        throw new Error(`Error tracking shipments: ${error.message}`);
    }
}

module.exports = {
    createShipmentProcessor,
    trackShipmentsProcessor
};
