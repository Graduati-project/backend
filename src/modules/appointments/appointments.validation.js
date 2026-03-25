import Joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";
import { dayEnum } from "../../config/models/specialty.model.js";

export const reservationValidation = {
  params: Joi.object()
    .keys({
      doctorID: generalFields.userId.required(),
    })
    .required(),
  body: Joi.object()
    .keys({
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
