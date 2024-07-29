const { getOrderDetails } = require("../service/sallaService");
const { sequelize, Customer, Order, Product, OrderItem } = require('../models'); // Adjust the path as necessary

async function job1Processor(job) {
    if (!job.data || !job.data.orderId) {
        throw new Error('Invalid job data');
    }

    const transaction = await sequelize.transaction();

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
            mobile_number: String(orderDetails.customer.mobile_code) + String(orderDetails.customer.mobile)
        };

        // Insert customer data
        const [customer, customerCreated] = await Customer.findOrCreate({
            where: { salla_customer_id: customerData.salla_customer_id },
            defaults: customerData,
            transaction
        });

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
            customer_id: customer.id, // Foreign key to Customer
        };

        // Insert order data
        const [order, orderCreated] = await Order.findOrCreate({
            where: { salla_order_id: orderData.salla_order_id },
            defaults: orderData,
            transaction
        });

        const products = orderDetails.items.map(item => ({
            salla_product_id: item.product.id,
            price: item.amounts.price_without_tax.amount,
            thumbnail: item.product.thumbnail,
            SKU: item.sku,
            tax: item.amounts.tax.amount.amount,
            discount: item.amounts.total_discount.amount,
            gtin: item.product.gtin
        }));

        // Insert product data
        const insertedProducts = await Promise.all(products.map(async productData => {
            return Product.findOrCreate({
                where: { salla_product_id: productData.salla_product_id },
                defaults: productData,
                transaction
            }).then(([product, created]) => product);
        }));

        const orderItems = orderDetails.items.map((item, index) => ({
            order_id: order.id, // Foreign key to Order
            product_id: insertedProducts[index].id, // Foreign key to Product
            quantity: item.quantity
        }));

        // Insert order item data
        await Promise.all(orderItems.map(async orderItemData => {
            await OrderItem.findOrCreate({
                where: {
                    order_id: orderItemData.order_id,
                    product_id: orderItemData.product_id,
                },
                defaults: orderItemData,
                transaction
            });
        }));

        // Commit the transaction
        await transaction.commit();
        console.log('Data inserted successfully');
    } catch (err) {
        // Rollback the transaction in case of error
        await transaction.rollback();
        console.error('Error inserting data:', err);
        throw err;
    }
}

module.exports = {
    job1Processor,
};
