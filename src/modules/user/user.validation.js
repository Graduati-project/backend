import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const shareProfile = {
  params: joi.object().keys({
    userId: generalFields.userId.required(),
  }),
};
