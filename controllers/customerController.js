require('dotenv').config();
const jwt = require('jsonwebtoken');
const { loginSchema, verifyOtpSchema } = require('../validators/customerValidator');
const { getOrder } = require('../service/sallaService');
const jobQueue = require('../queues/jobQueue');
const { OtpAttempt, Session, Customer } = require('../models'); 

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

            res.status(200).json({ message: "Order found and OTP sent" });
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

    const { phoneNumber, otp } = req.body;

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

        await OtpAttempt.destroy({
            where: {
                mobile_number: phoneNumber
            }
        });

        const customer = await Customer.findOne({
            where: {
                mobile_number: phoneNumber
            }
        });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const tokenPayload = {
            customerId: customer.id,
            phoneNumber: customer.mobile_number
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '10m' });

        const existingSession = await Session.findOne({
            where: { customer_id: customer.id }
        });

        if (existingSession) {
            existingSession.token = token;
            existingSession.expires_at = new Date(Date.now() + 30 * 60 * 1000);
            await existingSession.save();
        } else {
            await Session.create({
                customer_id: customer.id,
                token: token,
                expires_at: new Date(Date.now() + 30 * 60 * 1000)
            });
        }

        res.status(200).json({ message: 'OTP verified successfully', token: token });
    } catch (err) {
        console.error('Error verifying OTP:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};