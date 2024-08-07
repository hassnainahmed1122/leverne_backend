const axios = require('axios');
const { TamaraRequest, RefundRequest, Order } = require('../models');

const tamaraApiBase = 'https://api.tamara.co';
const tamaraApiToken = process.env.TAMARA_API_TOKEN;

async function processTamaraRequest(job) {
    const { refund_record_id } = job.data;

    const refundRequest = await RefundRequest.findByPk(refund_record_id, {
        include: [{
            model: Order,
            as: 'order',
            where: {
                payment_method: 'tamara_installment'
            }
        }]
    });

    if (!refundRequest) {
        return;
    }

    try {
        const orderResponse = await axios.get(`${tamaraApiBase}/merchants/orders/reference-id/${refundRequest.order.salla_reference_id}`, {
            headers: {
                'Authorization': `Bearer ${tamaraApiToken}`
            }
        });
        
        const orderData = orderResponse.data;
        const order_id = orderData.order_id;

        const refundPayload = {
            total_amount: {
                amount: refundRequest.refund_amount,
                currency: 'SAR'
            },
            comment: refundRequest.reason
        };

        const refundResponse = await axios.post(`${tamaraApiBase}/payments/simplified-refund/${order_id}`, refundPayload, {
            headers: {
                'Authorization': `Bearer ${tamaraApiToken}`
            }
        });

        await TamaraRequest.create({
            status: 'success',
            refund_request_id: refundRequest.id
        });

        return refundResponse;

    } catch (error) {
        await TamaraRequest.create({
            status: 'failed',
            failure_reason: error?.response?.data?.message || 'Request failed with status 500',
            refund_request_id: refundRequest.id
        });
        throw error;
    }
}

module.exports = { processTamaraRequest };
