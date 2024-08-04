const axios = require('axios');
const { TamaraRequest, RefundRequest } = require('../models');

const tamaraApiBase = 'https://api.tamara.co';
const tamaraApiToken = process.env.TAMARA_API_TOKEN; // Store your token in environment variables

async function processTamaraRequest(job) {
    const { refund_record } = job.data;

    try {
        // Fetch the order details
        const orderResponse = await axios.get(`${tamaraApiBase}/merchants/orders/reference-id/${refund_record.order.salla_reference_id}`, {
            headers: {
                'Authorization': `Bearer ${tamaraApiToken}`
            }
        });
        const orderData = orderResponse.data;
        const order_id = orderData.order_id;

        // Prepare refund payload
        const refundPayload = {
            total_amount: {
                amount: refund_record.refund_amount,
                currency: 'SAR'
            },
            comment: refund_record.reason
        };

        // Process the refund request
        const refundResponse = await axios.post(`${tamaraApiBase}/payments/simplified-refund/${order_id}`, refundPayload, {
            headers: {
                'Authorization': `Bearer ${tamaraApiToken}`
            }
        });
        const refundStatus = refundResponse.data;

        const status = refundStatus.success ? 'success' : 'failed';

        // Create a record of the Tamara request
        await TamaraRequest.create({
            status: status,
            refund_request_id: refund_record.id 
        });

        console.log(`Tamara request processed with status: ${status}`);
    } catch (error) {
        console.error('Error processing Tamara request:', error.message);
        throw error;
    }
}

module.exports = { processTamaraRequest };
