const axios = require('axios');
require('dotenv').config();

const getOrderDetails = async (order_number) => {
    const authToken = process.env.AUTH_TOKEN;

    const config = {
        method: 'get',
        url: `https://api.salla.dev/admin/v2/orders/?reference_id=${order_number}`,
        headers: {
            'User-Agent': 'Apidog/1.0.0 (https://apidog.com)',
            'Authorization': `Bearer ${authToken}`
        }
    };

    try {
        const response = await axios(config);
        console.log('testing..............', response.data.data[0])
        return response.data.data[0];
    } catch (err) {
        throw err;
    }
};

module.exports = {
    getOrderDetails,
};
