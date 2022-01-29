const joi = require("joi");


exports.signupValidate = function(user) {
    const JoiSchema = joi.object({
        username: joi.string()
        .min(5)
        .max(55)
        .required(),

        email: joi.string()
        .email()
        .min(2)
        .max(255)
        .required(),

        password: joi.string()
        .min(8)
        .max(255)
        .required(),

        confirmPassword: joi.string()
        .min(8)
        .max(255)
        .required(),
    
    })
    return JoiSchema.validate(user);
}


exports.loginValidate = function(user) {
    const JoiSchema = joi.object({
        userId: joi.string()
        .min(5)
        .max(55),

        email: joi.string()
        .email()
        .min(2)
        .max(255),

        password: joi.string()
        .min(8)
        .max(255)
        .required()

       
    
    })
    return JoiSchema.validate(user);
}

exports.resetValidate = function(user) {
    const JoiSchema = joi.object({
        oldEmail: joi.string()
        .email()
        .min(5)
        .max(255),

        newEmail: joi.string()
        .email()
        .min(5)
        .max(255)  
    
    })
    return JoiSchema.validate(user);
}




