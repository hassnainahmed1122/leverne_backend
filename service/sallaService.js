const axios = require('axios');
require('dotenv').config();

const getOrderDetails = async (order_number) => {
    const authToken = process.env.AUTH_TOKEN;

    const config = {
        method: 'get',
        url: `https://api.salla.dev/admin/v2/orders/${order_number}`,
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    };

    try {
        const response = await axios(config);
        return response.data.data;
    } catch (err) {
        throw err;
    }
};


const getOrder = async (reference_id) => {
    const authToken = process.env.AUTH_TOKEN;

    const config = {
        method: 'get',
        url: `https://api.salla.dev/admin/v2/orders/?reference_id=${reference_id}`,
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    };

    try {
        const response = await axios(config);
        return response.data.data[0];
    } catch (err) {
        throw err;
    }
};

module.exports = {
    getOrderDetails,
    getOrder
};
