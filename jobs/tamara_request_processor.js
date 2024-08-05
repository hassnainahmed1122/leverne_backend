const axios = require('axios');
const { TamaraRequest } = require('../models');

const tamaraApiBase = 'https://api.tamara.co';
const tamaraApiToken = process.env.TAMARA_API_TOKEN;

async function processTamaraRequest(job) {
    const { refund_record } = job.data;

    try {
        const orderResponse = await axios.get(`${tamaraApiBase}/merchants/orders/reference-id/${refund_record.order.salla_reference_id}`, {
            headers: {
                'Authorization': `Bearer ${tamaraApiToken}`
            }
        });
        const orderData = orderResponse.data;
        const order_id = orderData.order_id;
        const refundPayload = {
            total_amount: {
                amount: refund_record.refund_amount,
                currency: 'SAR'
            },
            comment: refund_record.reason
        };

        const refundResponse = await axios.post(`${tamaraApiBase}/payments/simplified-refund/${order_id}`, refundPayload, {
            headers: {
                'Authorization': `Bearer ${tamaraApiToken}`
            }
        });

        const status = 'success';

        await TamaraRequest.create({
            status: status,
            refund_request_id: refund_record.id
        });

    } catch (error) {
        const status = 'failed'
        await TamaraRequest.create({
            status: status,
            failure_reason: error.response.data.message,
            refund_request_id: refund_record.id
        });
        throw error;
    }
}

module.exports = { processTamaraRequest };
