const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { checkOtpAttemptLimit, checkOtpExpiration } = require('../middlewares/otpMiddleware');

router.post('/login', checkOtpAttemptLimit, customerController.login);
router.post('/verify-otp', checkOtpExpiration, customerController.verifyOtp);

module.exports = router;
