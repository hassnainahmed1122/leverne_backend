const axios = require('axios');
require('dotenv').config();
const { OtpAttempt } = require('../models');
const { generateOtp, formatPhoneNumber } = require('../utils/helperMethods');

const handleOtpGeneration = async (userId, mobileNumber) => {
    try {
        const otp = generateOtp();
        const otpExpiration = new Date(new Date().getTime() + 1 * 60 * 1000);
        const otpMessage = `Your OTP is: ${otp}`;

        const smsSent = await sendSMS(formatPhoneNumber(mobileNumber), otpMessage);
        if (smsSent) {
            await OtpAttempt.create({
                mobile_number: mobileNumber,
                otp: otp,
                otp_expiration: otpExpiration,
            });

            console.log('OTP generated and SMS sent successfully');
        } else {
            throw new Error('Failed to send OTP SMS');
        }
    } catch (err) {
        console.error('Error in handleOtpGeneration:', err.message);
        throw err;
    }
};

const sendSMS = async (numbers, msg) => {
    const config = {
        method: 'post',
        url: 'https://www.msegat.com/gw/sendsms.php',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            userName: process.env.SMS_USERNAME,
            numbers: numbers,
            userSender: process.env.SMS_USER_SENDER,
            apiKey: process.env.SMS_API_KEY,
            msg: msg
        }
    };

    try {
        const response = await axios(config);
        console.log('SMS Response:', response.data);

        if (response.data.message === 'Success' || response.data.code === '1') {
            return true;
        } else {
            console.error('SMS failed with response:', response.data);
            return true;
        }
    } catch (err) {
        console.error('Error sending SMS:', err.message);
        throw err;
    }
}

module.exports = {
    sendSMS,
    handleOtpGeneration
};
