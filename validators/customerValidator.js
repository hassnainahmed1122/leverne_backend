const Joi = require('joi');

const loginSchema = Joi.object({
    phoneNumber: Joi.string()
        .pattern(/^\+9665\d{8}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid phone number, it should start with +9665 followed by 8 digits',
            'any.required': 'Phone number is required'
        }),
    order_number: Joi.number()
        .required()
        .messages({
            'number.base': 'Order number must be a number',
            'any.required': 'Order number is required'
        })
});

const verifyOtpSchema = Joi.object({
    phoneNumber: Joi.string()
        .pattern(/^\+9665\d{8}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid phone number, it should start with +9665 followed by 8 digits',
            'any.required': 'Phone number is required'
        }),
    otp: Joi.string()
        .length(6)
        .pattern(/^\d+$/)
        .required()
        .messages({
            'string.length': 'OTP must be exactly 6 digits long',
            'string.pattern.base': 'OTP must contain only digits',
            'any.required': 'OTP is required'
        })
});


module.exports = {
    loginSchema,
    verifyOtpSchema
};
