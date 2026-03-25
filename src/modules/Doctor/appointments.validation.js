import Joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";
import { appointmentStatusEnum } from "../../config/models/appointment.model.js";

export const updateAppointmentStatus = {
  params: Joi.object()
    .keys({
      appointmentId: generalFields.userId.required(),
    })
    .required(),
  body: Joi.object()
    .keys({
      status: Joi.string()
        .valid(
          appointmentStatusEnum.confirmed,
          appointmentStatusEnum.cancelled,
          appointmentStatusEnum.completed,
        )
        .required(),
    })
    .required(),
};

export const createTreatment = {
  body: Joi.object()
    .keys({
      patientId: generalFields.userId.required(),
      treatmentName: Joi.string().min(3).max(200).required(),
      startDate: Joi.date().required(),
      endDate: Joi.date().optional(),
    })
    .required(),
};

export const updateTreatment = {
  params: Joi.object()
    .keys({
      treatmentId: generalFields.userId.required(),
    })
    .required(),
  body: Joi.object()
    .keys({
      treatmentName: Joi.string().min(3).max(200).optional(),
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional(),
    })
    .required(),
};
