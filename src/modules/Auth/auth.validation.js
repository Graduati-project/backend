import Joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";
import e from "express";


export const login={
    body:Joi.object().keys({
        email:generalFields.email.required(),
        password:generalFields.password.required()
    }).required()
}

export const signup={
    body:Joi.object().keys({
        firstName:generalFields.firstName,
        lastName:generalFields.LastName,
        email:generalFields.email,
        password:generalFields.password,
        confirmPassword:generalFields.confirmPassword,
        phone:generalFields.phone
    }).required()
}
export const sendResetPasswordEmail={
    body:Joi.object().keys({
        email:generalFields.email.required()
    }).required()
}

export const resetPassword={
    body:Joi.object().keys({
        email:generalFields.email.required(),
        newPassword:generalFields.password.required(),
        otp:Joi.string().length(6).required()
    }).required()
}