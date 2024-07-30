require('dotenv').config();
const { loginSchema, verifyOtpSchema } = require('../validators/customerValidator');
const { getOrder } = require('../service/sallaService');
const jobQueue = require('../queues/jobQueue');
const { OtpAttempt } = require('../models'); 

exports.login = async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { phoneNumber, order_number } = req.body;

    try {
        const order_by_reference = await getOrder(order_number);
        const { id } = order_by_reference;
        if (id) {
            await jobQueue.add('job1', { orderId: id });

            res.status(200).json({ message: "Order found and jobs added to the queue" });
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

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (err) {
        console.error('Error verifying OTP:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

