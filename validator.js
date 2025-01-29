const Joi = require('joi');

module.exports.authSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

module.exports.profileSchema = Joi.object({
    name: Joi.string().allow(''),
    mobileNumber: Joi.number().min(10),
    bio: Joi.string().allow(''),
    availability: Joi.array().items(
        Joi.object({
            startTime: Joi.string(),
            endTime: Joi.string(),
        }),
    ),
});

module.exports.notificationSchema = Joi.object({
    recipients: Joi.array().items(Joi.string()).min(1).required(),
    content: Joi.string().max(500).required(),
    isCritical: Joi.boolean(),
});
