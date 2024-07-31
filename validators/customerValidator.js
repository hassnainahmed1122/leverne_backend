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
        }),
    order_id: Joi.number()
        .required()
        .messages({
            'number.base': 'Order number must be a number',
            'any.required': 'Order number is required'
        })
});

const ibanValidationSchema = Joi.string()
    .pattern(/^SA\d{22}$/, 'IBAN')
    .required()
    .messages({
        'string.pattern.name': 'Invalid IBAN format',
        'string.empty': 'IBAN is required',
        'any.required': 'IBAN is required'
    })
    .custom((value, helper) => {
        if (/\s/.test(value)) {
            return helper.message('IBAN should not contain spaces');
        }
        return value.replace(/\s+/g, '');
    });

const refundRequestSchema = Joi.object({
    iban: ibanValidationSchema,
    city: Joi.string().required().messages({
        'string.empty': 'City is required',
        'string.required': 'City is required'
    }),
    reason: Joi.string().required().messages({
        'string.empty': 'Reason is required'
    }),
    condition: Joi.string().required().messages({
        'string.empty': 'Product status is required'
    }),
    items: Joi.array().items(
        Joi.object({
            product_id: Joi.number().integer().required().messages({
                'number.base': 'Product ID must be a number',
                'any.required': 'Product ID is required'
            }),
            quantity: Joi.number().integer().min(1).required().messages({
                'number.base': 'Quantity must be a number',
                'number.min': 'Quantity must be at least 1',
                'any.required': 'Quantity is required'
            })
        })
    ).min(1).required().messages({
        'array.base': 'Items must be an array',
        'array.min': 'At least one item is required',
        'any.required': 'Items are required'
    })
});


module.exports = {
    loginSchema,
    verifyOtpSchema,
    refundRequestSchema
};
