require('dotenv').config();
const jwt = require('jsonwebtoken');
const { loginSchema, verifyOtpSchema, refundRequestSchema } = require('../validators/customerValidator');
const { getOrder } = require('../service/sallaService');
const jobQueue = require('../queues/jobQueue');
const { OtpAttempt, Session, Customer, Order, OrderItem, RefundRequest, RefundItem, sequelize, Product } = require('../models');
const { generateUnique8DigitNumber } = require('../utils/helperMethods')

exports.login = async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { phoneNumber, order_number } = req.body;

    try {
        const order_by_reference = await getOrder(order_number);

        if (!order_by_reference || !order_by_reference.id) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const { id, customer } = order_by_reference;

        const customerMobileNumber = `${customer.mobile_code}${customer.mobile}`;

        // if (customerMobileNumber !== phoneNumber) {
        //     return res.status(400).json({ message: "Customer number doesn't match" });
        // }

        const customerData = {
            salla_customer_id: customer.id,
            first_name: customer.first_name,
            last_name: customer.last_name,
            email: customer.email,
            mobile_number: customerMobileNumber,
            city: customer.city
        };

        const [customerRecord] = await Customer.findOrCreate({
            where: { salla_customer_id: customerData.salla_customer_id },
            defaults: customerData,
        });

        await jobQueue.add('job1', { orderId: id, customerId: customerRecord.id, mobileNumber: phoneNumber });

        res.status(200).json({ message: 'Order found and OTP sent', orderId: id });
    } catch (err) {
        console.error('Error fetching order:', err);
        if (err.response && err.response.status === 404) {
            res.status(404).json({ message: 'Order not found' });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};


exports.verifyOtp = async (req, res) => {
    const { error } = verifyOtpSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { phoneNumber, otp, order_id } = req.body;

    try {
        const otpAttempt = await OtpAttempt.findOne({
            where: {
                mobile_number: phoneNumber,
                otp: otp
            }
        });

        if (!otpAttempt) {
            return res.status(404).json({ message: 'Invalid OTP' });
        }

        const customer = await Customer.findOne({
            where: {
                mobile_number: phoneNumber
            }
        });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const order = await Order.findOne({
            where: { salla_order_id: order_id }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const tokenPayload = {
            customerId: customer.id,
            phoneNumber: customer.mobile_number,
            orderId: order.id
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);

        const existingSession = await Session.findOne({
            where: { customer_id: customer.id }
        });

        if (existingSession) {
            existingSession.token = token;
            existingSession.order_id = order.id;
            existingSession.expires_at = new Date(Date.now() + 30 * 60 * 1000);
            await existingSession.save();
        } else {
            await Session.create({
                customer_id: customer.id,
                token: token,
                order_id: order.id,
                expires_at: new Date(Date.now() + 30 * 60 * 1000)
            });
        }

        res.status(200).json({ message: 'OTP verified successfully', token: token });
    } catch (err) {
        console.error('Error verifying OTP:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const orderId = req.orderId;

        const order = await Order.findOne({
            where: { id: orderId },
            include: [
                {
                    model: OrderItem,
                    include: [
                        {
                            model: Product,
                            attributes: ['id','salla_product_id', 'price', 'thumbnail', 'SKU', 'tax', 'discount', 'gtin', 'name', 'tax_percentage']
                        }
                    ]
                },
                {
                    model: Customer,  
                    attributes: ['first_name', 'last_name', 'email', 'city']
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ order });
    } catch (err) {
        console.error('Error fetching Order and OrderItems:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};





exports.createRefundRequest = async (req, res) => {
    const { error } = refundRequestSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { bank_code,iban, city, reason, condition, first_name, last_name, family_name, email, refund_amount, items, payment_method } = req.body;

    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    const transaction = await sequelize.transaction();

    try {
        const uuid = await generateUnique8DigitNumber();
        const refundRequest = await RefundRequest.create({
            customer_id: req.customerId,
            order_id: req.orderId,
            iban,
            uuid,
            city,
            reason,
            condition,
            first_name,
            last_name,
            family_name,
            email,
            refund_amount,
            payment_method,
            bank_code
        }, { transaction });

        await transaction.commit();

        await jobQueue.add('createRefundItems', {
            refundRequestId: refundRequest.id,
            items,
            orderId: req.orderId
        });

        await jobQueue.add('sendEmail', {
            to: 'hassnainahmed111222@gmail.com',
            city: refundRequest.city,
            returnRequestId: refundRequest.uuid,
            aramexPolicyNumber: '123456789'
        });

        res.status(201).json(refundRequest);
    } catch (err) {
        await transaction.rollback();
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
};