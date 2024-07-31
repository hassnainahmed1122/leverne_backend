require('dotenv').config();
const jwt = require('jsonwebtoken');
const { loginSchema, verifyOtpSchema, refundRequestSchema } = require('../validators/customerValidator');
const { getOrder } = require('../service/sallaService');
const jobQueue = require('../queues/jobQueue');
const { OtpAttempt, Session, Customer, Order, OrderItem, RefundRequest, RefundItem ,sequelize } = require('../models'); 

exports.login = async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { phoneNumber, order_number } = req.body;

    try {
        const order_by_reference = await getOrder(order_number);
        const { id, customer } = order_by_reference;

        if (id) {
            const customerData = {
                salla_customer_id: customer.id,
                first_name: customer.first_name,
                last_name: customer.last_name,
                email: customer.email,
                mobile_number: String(customer.mobile_code) + String(customer.mobile)
            };

            const [customerRecord] = await Customer.findOrCreate({
                where: { salla_customer_id: customerData.salla_customer_id },
                defaults: customerData
            });

            await jobQueue.add('job1', { orderId: id, customerId: customerRecord.id, mobileNumber: phoneNumber });

            res.status(200).json({ message: "Order found and OTP sent", orderId: id });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
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

        // Generate JWT token
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '10m' });

        // Find an existing session
        const existingSession = await Session.findOne({
            where: { customer_id: customer.id }
        });

        // Update existing session or create a new one
        if (existingSession) {
            existingSession.token = token;
            existingSession.order_id = order.id; // Ensure session is updated with the correct order_id
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
            include: [{
                model: OrderItem,
            }]
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
        return res.status(400).json({ error: error.details[0].message });
    }

    const { iban, city, reason, condition, items } = req.body;

    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    const transaction = await sequelize.transaction();

    try {
        const refundRequest = await RefundRequest.create({
            customer_id: req.customerId,
            order_id: req.orderId,
            iban,
            city,
            reason,
            condition,
        }, { transaction });
        await transaction.commit();

        await jobQueue.add('createRefundItems', {
            refundRequestId: refundRequest.id,
            items,
            orderId: req.orderId
        });

        res.status(201).json(refundRequest);
    } catch (err) {
        await transaction.rollback();
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
};
