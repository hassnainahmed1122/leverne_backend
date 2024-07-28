const { getOrderDetails } = require("../service/sallaService");
const customer = require("../models/customer");
const order = require("../models/order");

async function job1Processor(job) {
    if (!job.data || !job.data.orderId) {
        throw new Error('Invalid job data');
    }

    try {
        const orderDetails = await getOrderDetails(job.data.orderId);
        const totalDiscount = orderDetails.amounts.discounts.reduce((sum, item) => {
            return sum + parseFloat(item.discount);
        }, 0);
        const customerData = {
            salla_customer_id: orderDetails.customer.id,
            first_name: orderDetails.customer.first_name,
            last_name: orderDetails.customer.last_name,
            email: orderDetails.customer.email,
            mobile_number: String(orderDetails.customer.mobile_code) + String(orderDetails.customer.mobile )
        };

        const orderData = {
            salla_order_id: orderDetails.id,
            payment_method: orderDetails.payment_method,
            status: orderDetails.status.slug,
            date: orderDetails.date.date,
            sub_total: orderDetails.amounts.sub_total.amount,
            shipping_cost: orderDetails.amounts.shipping_cost.amount,
            cash_on_delivery: orderDetails.amounts.cash_on_delivery.amount,
            tax_amount: orderDetails.amounts.tax.amount,
            discount_amount: totalDiscount,
            salla_reference_id: orderDetails.reference_id,
        };

        const products = orderDetails.items

        const  productData = products.map(item => ({
            salla_product_id: item.product.id,
            price: item.amounts.price_without_tax.amount,
            thumbnail: item.product.thumbnail,
            SKU: item.sku,
            tax: item.amounts.tax.amount.amount,
            discount: item.amounts.total_discount.amount,
            gtin: item.product.gtin
        }))

        const orderItems = products.map(item => ({
            quantity: item.quantity
        }))


    } catch (err) {
        throw err;
    }
}

async function job2Processor(job) {
    try {
        return { status: 'done' };
    } catch (err) {
        console.error('Error in Job 2:', err);
        throw err;
    }
}

async function job3Processor(job) {
    try {
        return { status: 'done' };
    } catch (err) {
        console.error('Error in Job 3:', err);
        throw err;
    }
}

module.exports = {
    job1Processor,
    job2Processor,
    job3Processor
};
