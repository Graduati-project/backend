import Joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

import { dayEnum } from "../../config/models/specialty.model.js";

export const specialtyQuery = {
  query: Joi.object()
    .keys({
      specialtyId: generalFields.userId.optional(),
    })
    .required(),
};

export const bookAppointment = {
  body: Joi.object()
    .keys({
      doctorId: generalFields.userId.required(),
      hour: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required()
        .messages({
          "string.pattern.base": "hour must be in HH:mm format (e.g. 13:00)",
        }),
      day: Joi.string()
        .valid(...Object.values(dayEnum))
        .required(),
    })
    .required(),
};
