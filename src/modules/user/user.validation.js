import Joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const updateBasicInfo = {
  body: Joi.object()
    .keys({
      firstName: generalFields.firstName,
      lastName: generalFields.lastName,
      gender: generalFields.gender,
    })
    .required(),
};

export const frezzeAccount = {
  params: Joi.object().keys({
    userId: generalFields.userId,
  }),
};
export const restoreAccount = {
  params: Joi.object()
    .keys({
      userId: generalFields.userId.required(),
    })
    .required(),
};

export const updatePassword = {
  body: Joi.object().keys({
    oldPassword: generalFields.password.required(),
    newPassword: generalFields.password.not(Joi.ref("oldPassword")).required(),
    confirmNewPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
    flag: generalFields.flag,
  }),
};

export const deleteAccount = {
  params: Joi.object().keys({
    userId: generalFields.userId.required(),
  }),
};

export const logout = {
  body: Joi.object().keys({
    flag: generalFields.flag,
  }),
};

export const updateProfileImage = {
  file: generalFields.file.required(),
};

export const addDoctor = {
  body: Joi.object()
    .keys({
      firstName: generalFields.firstName.required(),
      lastName: generalFields.lastName.required(),
      email: generalFields.email.required(),
      password: generalFields.password.required(),
      confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
      specialtyId: generalFields.userId.required(),
    })
    .required(),
};
