const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { checkOtpAttemptLimit, checkOtpExpiration } = require('../middlewares/otpMiddleware');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/login', checkOtpAttemptLimit, customerController.login);
router.post('/verify-otp', checkOtpExpiration, customerController.verifyOtp);
router.get('/order-details', authenticate, customerController.getOrderDetails);

module.exports = router;
