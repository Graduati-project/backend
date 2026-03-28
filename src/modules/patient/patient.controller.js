import { Router } from "express";
import * as authMiddleware from "../../middleware/authentication.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import { roleenum } from "../../config/models/user.model.js";
import * as patientValidation from "./patient.validation.js";
import * as patientService from "./patient.service.js";

const patientRouter = Router();

patientRouter.use(
  authMiddleware.authentication(),
  authMiddleware.authorization({ role: [roleenum.patient] }),
);

patientRouter.get(
  "/specialties/overview/:specialtyId",
  validation(patientValidation.specialtyOverviewByIdParam),
  patientService.getSpecialtiesDoctorOverview,
);
patientRouter.get(
  "/specialties/overview",
  validation(patientValidation.specialtyQuery),
  patientService.getSpecialtiesDoctorOverview,
);
patientRouter.get(
  "/specialties/",
  validation(patientValidation.specialtyQuery),
  patientService.getSpecialtiesWithDoctors,
);
patientRouter.get("/appointments", patientService.myAppointments);
patientRouter.get("/treatments", patientService.myTreatments);
patientRouter.get("/my-doctors", patientService.myDoctors);
patientRouter.post(
  "/book",
  validation(patientValidation.bookAppointment),
  patientService.bookAppointment,
);
patientRouter.patch(
  "/appointments/:appointmentId/cancel",
  validation(patientValidation.cancelAppointment),
  patientService.cancelAppointment,
);

export default patientRouter;
