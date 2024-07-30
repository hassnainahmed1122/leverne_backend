const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { checkOtpAttemptLimit, checkOtpExpiration } = require('../middlewares/otpMiddleware');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/login', checkOtpAttemptLimit, customerController.login);
router.post('/verify-otp', checkOtpExpiration, customerController.verifyOtp);

router.get('/test-session', authenticate, async (req, res) => {
    try {
        const customerId = req.customerId;
        res.status(200).json({ message: 'Token is valid', customerId: customerId });
    } catch (err) {
        console.error('Error in /test-session route:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
