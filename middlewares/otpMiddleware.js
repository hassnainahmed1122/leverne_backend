const { OtpAttempt } = require('../models');

const checkOtpAttemptLimit = async (req, res, next) => {
    try {
        const mobile_number = req.body.phoneNumber;
        if (!mobile_number) {
            return res.status(400).json({ message: 'mobile number is required' });
        }

        const limitReached = await OtpAttempt.checkAttemptLimit(mobile_number);
        if (limitReached) {
            return res.status(429).json({ message: 'Reached the limit of 10 OTP attempts per day' });
        }

        next();
    } catch (err) {
        console.error('Error checking OTP attempt limit:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const checkOtpExpiration = async (req, res, next) => {
    try {
        const otp = req.body.otp;
        if (!otp) {
            return res.status(400).json({ message: 'OTP is required' });
        }

        const otpAttempt = await OtpAttempt.findOne({ where: { otp } });
        if (!otpAttempt) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const isExpired = OtpAttempt.checkOtpExpiration(otpAttempt.otp_expiration);
        if (isExpired) {
            return res.status(400).json({ error: 'OTP has expired' });
        }

        next();
    } catch (err) {
        console.error('Error checking OTP expiration:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    checkOtpAttemptLimit,
    checkOtpExpiration
};
