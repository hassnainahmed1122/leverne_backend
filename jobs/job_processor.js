const { getOrderDetails } = require("../service/sallaService");
const { sequelize, Customer, Order, Product, OrderItem } = require('../models');
const { handleOtpGeneration } = require('../service/smsService');

async function job1Processor(job) {
    if (!job.data || !job.data.orderId || !job.data.customerId) {
        throw new Error('Invalid job data');
    }

    const transaction = await sequelize.transaction();

    try {
        const orderDetails = await getOrderDetails(job.data.orderId);

        const address = orderDetails.shipping.pickup_address.shipping_address;
        if (address) {
            await Customer.update(
                { address: address },
                { where: { id: job.data.customerId }, transaction }
            );
        }
        const totalDiscount = orderDetails.amounts.discounts.reduce((sum, item) => {
            return sum + parseFloat(item.discount);
        }, 0);

        const orderData = {
            salla_order_id: orderDetails.id,
            payment_method: orderDetails.payment_method,
            status: orderDetails.status.slug,
            date: orderDetails.date.date,
            sub_total: orderDetails.amounts.sub_total.amount,
            shipping_cost: orderDetails.amounts.shipping_cost.amount,
            cash_on_delivery: orderDetails.amounts.cash_on_delivery.amount,
            tax_amount: orderDetails.amounts.tax.amount.amount,
            discount_amount: totalDiscount,
            salla_reference_id: orderDetails.reference_id,
            customer_id: job.data.customerId,
            tax_percentage: orderDetails.amounts.tax.percent
        };

        let order = await Order.findOne({
            where: { salla_order_id: orderData.salla_order_id },
            transaction
        });

        if (order) {
            await order.update(orderData, { transaction });
        } else {
            order = await Order.create(orderData, { transaction });
        }

        const productMap = new Map();

        for (const item of orderDetails.items) {
            const productData = {
                salla_product_id: item.product.id,
                price: item.amounts.price_without_tax.amount,
                thumbnail: item.product.thumbnail,
                SKU: item.sku,
                tax: (item.amounts.tax.amount.amount / item.quantity).toFixed(2),
                discount: (item.amounts.total_discount.amount / item.quantity).toFixed(2),
                gtin: item.product.gtin,
                name: item.name,
                tax_percentage: item.amounts.tax.percent || 0,
            };

            try {
                let product = await Product.findOne({
                    where: { salla_product_id: productData.salla_product_id },
                    transaction
                });

                if (product) {
                    await product.update(productData, { transaction });
                } else {
                    product = await Product.create(productData, { transaction });
                }

                productMap.set(productData.salla_product_id, product.id);
            } catch (error) {
                console.error('Error handling product:', error);
                throw error;
            }
        }

        const orderItems = new Map(); // Use Map to ensure unique order items by product_id

        // Handle each item in the orderDetails
        for (const item of orderDetails.items) {
            const productId = productMap.get(item.product.id);
            if (productId) {
                if (orderItems.has(productId)) {
                    // If product_id already exists, increment the quantity
                    let existingOrderItem = orderItems.get(productId);
                    existingOrderItem.quantity += item.quantity;
                } else {
                    // Otherwise, create a new order item entry
                    orderItems.set(productId, {
                        order_id: order.id,
                        product_id: productId,
                        quantity: item.quantity
                    });
                }
            } else {
                console.error('Product ID not found for item:', item);
            }
        }

        // Now insert/update order items in the database
        for (const orderItemData of orderItems.values()) {
            try {
                const existingOrderItem = await OrderItem.findOne({
                    where: {
                        order_id: orderItemData.order_id,
                        product_id: orderItemData.product_id
                    },
                    transaction
                });

                if (existingOrderItem) {
                    await existingOrderItem.update(orderItemData, { transaction });
                } else {
                    await OrderItem.create(orderItemData, { transaction });
                }
            } catch (error) {
                console.error('Error handling order item:', error);
                throw error;
            }
        }

        await transaction.commit();
        await handleOtpGeneration(job.data.customerId, job.data.mobileNumber);

    } catch (err) {
        await transaction.rollback();
        console.error('Error processing job:', err);
        throw err;
    }
}

module.exports = {
    job1Processor,
};
