import Joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const addDoctor = {
  body: Joi.object()
    .keys({
      firstName: generalFields.firstName.required(),
      lastName: generalFields.lastName.required(),
      email: generalFields.email.required(),
      gender: generalFields.gender.required(),
      phone: generalFields.phone.required(),
      password: generalFields.password.required(),
      confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
      specialtyId: generalFields.userId.required(),
    })
    .required(),
};

export const patientIdParam = {
  params: Joi.object()
    .keys({
      patientId: generalFields.userId.required(),
    })
    .required(),
};

export const addStaff = {
  body: Joi.object()
    .keys({
      firstName: generalFields.firstName.required(),
      lastName: generalFields.lastName.required(),
      email: generalFields.email.required(),
      gender: generalFields.gender.required(),
      phone: generalFields.phone.required(),
      password: generalFields.password.required(),
      confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    })
    .required(),
};
